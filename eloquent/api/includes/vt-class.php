<?php 
/*******************************************************
 * 
 * 
 *     vt-class.php
 * 
 * Contains the core backend for VetTix.org API funcs
 * 
 * 
 *******************************************************/

namespace App;

require_once('../vendor/autoload.php');

require_once('vt-config.php');
require_once('models.php');

use Illuminate\Database\Capsule\Manager;
use MysqlConfig;
use App\Models\{FailedLogin, UserLogin};

/**
 * VetTix.org
 */
class VetTix 
{
    
    public $mgr;     // Illuminate\Database\Capsule\Manager 
    public $cfg;     // MySQL config in vt-config.php

    /**
     * constructor
     *
     * @return void
     */
    function __construct() 
    {

        define('API_BASE_PATH', 'https://www.vettix.org/uapi');

        session_start();

        $this->initialize_db();

    }

    /**
     * Initialize Eloquent with SQL config
     *
     * @return void
     */
    private function initialize_db() 
    {

        $this->mgr = new Manager();

        $cfg = new MysqlConfig();

        $this->mgr->addConnection([
            "driver" => "mysql",
            "host" => $cfg->host,
            "database" => $cfg->db,
            "username" => $cfg->user,
            "password" => $cfg->pass
         ]);

        $this->mgr->setAsGlobal();
        
        $this->mgr->bootEloquent();
    }

    /**
     * Return Bearer token from stored session
     * @return string|void
     */
    final public function current_token() 
    { 

        return isset($_SESSION['token']) ? $_SESSION['token'] : NULL;

    }

    /**
     * Login using email & API key
     * Store Bearer token to $_SESSION
     * Redirect
     * 
     * @param string $email
     * @param string $apikey
     * @return object
     */
    final public function login($email, $apikey) 
    {

        $this->logout();

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL,API_BASE_PATH.'/user/limited/login');
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, ['email' => $email, 'password' => $apikey]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $output = curl_exec($ch);
        curl_close ($ch);

        $check = json_decode($output);

        if (isset($check->token)) 
        {

            $_SESSION['token'] = $check->token;

            $user_login = UserLogin::create([
                'email' => $email,
                'token' => $check->token,
            ]);

            //$user_login->save();

        } else {
            
            $failed_login = FailedLogin::create([
                'email' => $email,
                'password' => $apikey,
            ]);
            
        }
        
        return $output;

    }

    /**
     * Clear session Bearer token
     * @return void
     */
    final public function logout() 
    {

        $_SESSION['token'] = NULL;

    }

    /**
     * Retrieve a list of all available event types (eventTypeGet)
     *
     * @return object
     */
    final public function get_event_types() 
    {

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer '.$this->current_token()]);
        curl_setopt($ch, CURLOPT_URL, API_BASE_PATH.'/event-type');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $output = curl_exec($ch);
        $op = json_decode($output);
        curl_close ($ch);
        if (isset($op->errorCode) && $op->errorCode === 'AUTHENTICATION_FAILED') {
            $this->logout();
        }
        return $output;
    }

    /**
     * Retrieves a list of all available states (stateGet)
     *
     * @return object
     */
    final public function get_states() 
    {

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, API_BASE_PATH.'/state');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $output = curl_exec($ch);
        curl_close ($ch);

        return $output;
    }

    /**
     * Search /event API
     *
     * @param string $stateCode
     * @param string|int $eventTypeID
     * @param string $sortBy
     * @param string $eventStatus
     * @param int $start
     * @param int $count
     * @return object
     */
    final public function perform_search($stateCode, $eventTypeID, $sortBy, $eventStatus, $start = 1, $count = 100) 
    {

        $params = [
            'start' => $start, 
            'count' => $count, 
            'stateCode' => $stateCode,
            'eventTypeID' => $eventTypeID,
            'sortBy' => $sortBy,
            'eventStatus' => $eventStatus
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer '.$this->current_token()]);
        curl_setopt($ch, CURLOPT_URL, API_BASE_PATH.'/event?'.http_build_query($params));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $output = curl_exec($ch);
        curl_close ($ch);

        $check = json_decode($output);
        if (isset($check->errorCode) && $check->errorCode === 'AUTHENTICATION_FAILED') {
            $this->logout();
        }

        return $output;
    }


    /**
     * Check inventory for $ticketCount amount of seats
     *
     * @param string|int $eventID
     * @param string|int $ticketCount
     * @return string
     */
    final public function perform_inventory_search($eventID, $ticketCount = 4) 
    {

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer '.$this->current_token()]);
        curl_setopt($ch, CURLOPT_URL, API_BASE_PATH.'/inventory/'.$eventID);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $output = curl_exec($ch);
        curl_close ($ch);

        $check = json_decode($output);
        if (isset($check->errorCode) && $check->errorCode === 'AUTHENTICATION_FAILED') {
            $this->logout();
        }
        
        return $output;

    }
}
