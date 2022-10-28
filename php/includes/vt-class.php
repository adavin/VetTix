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

    /**
     * Retrieve a list of all available event types (eventTypeGet)
     *
     * @return object
     */
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
        if ($this->current_token() === NULL) {
            header('Location: login.php');
            die();
        }
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, API_BASE_PATH.'/state');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $output = json_decode(curl_exec($ch));
        curl_close ($ch);
        return $output;
    }

    /**
     * Undocumented function
     *
     * @param [type] $stateCode
     * @param [type] $eventTypeID
     * @param [type] $sortBy
     * @param [type] $eventStatus
     * @param integer $start
     * @param integer $count
     * @return object
     */
    function performSearch($stateCode, $eventTypeID, $sortBy, $eventStatus, $start = 1, $count = 100) {
        if ($this->current_token() === NULL) {
            header('Location: login.php');
            die();
        }
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
     * Undocumented function
     *
     * @param [type] $stateCode
     * @param [type] $eventTypeID
     * @param [type] $sortBy
     * @param [type] $eventStatus
     * @param integer $start
     * @param integer $count
     * @return string
     */
    function performInventorySearch($eventID, $ticketCount = 4) {
        if ($this->current_token() === NULL) {
            header('Location: login.php');
            die();
        }
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
        //this is much cleaner in PHP than JS ;)
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
