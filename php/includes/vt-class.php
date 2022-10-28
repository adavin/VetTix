<?php 
if (count(get_included_files()) === 1) {
    header('HTTP/1.0 403 Forbidden');
    die('Access denied.');
} 

/**
 * VetTix.org
 */
class VetTix {
    
    /**
     * constructor
     *
     * @return void
     */
    function __construct() {
        session_start();
        define('API_BASE_PATH', 'https://www.vettix.org/uapi');
    }

    /**
     * Return Bearer token from stored session
     * @return string or NULL
     */
    function current_token() { 
        return isset($_SESSION['token']) ? $_SESSION['token'] : NULL;
    }

    /**
     * Make sure user is logged in
     *
     * @return void
     */
    function forceLogin() {
        if ($this->current_token() === NULL) {
            header('Location: login.php');
            die();
        } 
    }
    /**
     * Login using email & API key
     * Store Bearer token to $_SESSION
     * Redirect
     * 
     * @param [type] $email
     * @param [type] $apikey
     * @return void
     */
    function login($email, $apikey) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL,API_BASE_PATH.'/user/limited/login');
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, ['email' => $email, 'password' => $apikey]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $output = json_decode(curl_exec($ch));
        curl_close ($ch);
        if (isset($output->token)) {
            $_SESSION['token'] = $output->token;
            header('Location: index.php');
            die();
        }
        return $output;
    }

    /**
     * Clear session Bearer token
     * @return void
     */
    function logout() {
        $_SESSION['token'] = NULL;
        header('Location: login.php');
        die();
    }

    /**
     * return header.php
     * @return void
     */
    function get_header() {
        return require_once('includes/header.php');
    }

    /**
     * return footer.php
     * @return void
     */
    function get_footer() {
        return require_once('includes/footer.php');
    }

    function get_event_types() {
        if ($this->current_token() === NULL) {
            header('Location: login.php');
            die();
        }
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer '.$this->current_token()]);
        curl_setopt($ch, CURLOPT_URL, API_BASE_PATH.'/event-type');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $output = json_decode(curl_exec($ch));
        curl_close ($ch);
        return $output;
    }
    function get_states() {
        if ($this->current_token() === NULL) {
            header('Location: login.php');
            die();
        }
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer '.$this->current_token()]);
        curl_setopt($ch, CURLOPT_URL, API_BASE_PATH.'/state');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $output = json_decode(curl_exec($ch));
        curl_close ($ch);
        return $output;
    }
}