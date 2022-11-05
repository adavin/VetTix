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
     * @return string|void
     */
    function current_token() { 
        return isset($_SESSION['token']) ? $_SESSION['token'] : NULL;
    }

    /**
     * Make sure user is logged in
     *
     * @return void
     */
    function force_login() {
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
     * @param string $email
     * @param string $apikey
     * @return object
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
     * header.php
     * @return void
     */
    function get_header() {
        return require_once('includes/header.php');
    }

    /**
     * footer.php
     * @return void
     */
    function get_footer() {
        return require_once('includes/footer.php');
    }

    /**
     * Retrieve a list of all available event types (eventTypeGet)
     *
     * @return object
     */
    function get_event_types() {
        $this->force_login();
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer '.$this->current_token()]);
        curl_setopt($ch, CURLOPT_URL, API_BASE_PATH.'/event-type');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $output = json_decode(curl_exec($ch));
        curl_close ($ch);
        if (isset($output->errorCode) && $output->errorCode === 'AUTHENTICATION_FAILED') {
            $this->logout();
        }
        return $output;
    }

    /**
     * Retrieves a list of all available states (stateGet)
     *
     * @return object
     */
    function get_states() {
        $this->force_login();
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, API_BASE_PATH.'/state');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $output = json_decode(curl_exec($ch));
        curl_close ($ch);
        return $output;
    }

    /**
     * Search /event API
     *
     * @param string $stateCode
     * @param string|integer $eventTypeID
     * @param string $sortBy
     * @param string $eventStatus
     * @param integer $start
     * @param integer $count
     * @return object
     */
    function perform_search($stateCode, $eventTypeID, $sortBy, $eventStatus, $start = 1, $count = 100) {
        $this->force_login();
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
        $output = json_decode(curl_exec($ch));
        curl_close ($ch);
        if (isset($output->errorCode) && $output->errorCode === 'AUTHENTICATION_FAILED') {
            $this->logout();
        }
        return $output;
    }


    /**
     * Check inventory for $ticketCount amount of seats
     *
     * @param string|integer $eventID
     * @param string|integer $ticketCount
     * @return string
     */
    function perform_inventory_search($eventID, $ticketCount = 4) {
        $this->force_login();
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer '.$this->current_token()]);
        curl_setopt($ch, CURLOPT_URL, API_BASE_PATH.'/inventory/'.$eventID);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $output = json_decode(curl_exec($ch));
        curl_close ($ch);
        if (isset($output->errorCode) && $output->errorCode === 'AUTHENTICATION_FAILED') {
            $this->logout();
        }
        
        $seating = [];

        foreach ($output as $seat) $seating[$seat->section][$seat->row][] = intval($seat->seat); 
        
        foreach (array_keys($seating) as $section) {
            foreach (array_keys($seating[$section]) as $row) {
                foreach ($seating[$section][$row] as $seat) {
                    if (in_array($seat - 1, $seating[$section][$row]))  continue;  
                    $enoughSeats = TRUE;
                    for ($i=0; $i<$ticketCount; $i++){
                        if (!in_array($seat + $i, $seating[$section][$row])) {
                            $enoughSeats = FALSE;
                        }
                    }
                    if ($enoughSeats) {
                        return "We found some tickets for you!\nSection: $section \nRow: ${row} \nSeats: $seat-".($seat+$ticketCount-1);
                    }
                }
            }
        }
        return 'Sorry, we were unable to find sufficient seating for your group';
    }
}
