<?php
/*******************************************************
 * 
 * 
 *      index.php
 * 
 * This is the only public-served file. 
 * 
 * index.js has been altered from the original jQuery
 * version to use this index.php file instead of the 
 * VetTix API, which is accessed from vt-class.php
 * 
 * \eloquent\index.js
 * 
 * 
 *******************************************************/
require_once('../includes/vt-class.php');

use App\VetTix;

$VT = new VetTix();

/**
 * Default response if $_POST['action'] is empty
 */
if (!isset($_POST['action'])) 
{

    $response = json_encode([
        'result' => 'No action specified',
        'post' => $_POST
    ]);

    header('Content-Type: application/json');
    die ($response);

}

/**
 * Handle $_POST['action']
 */
switch ($_POST['action']) 
{

    case 'login':
        $response = $VT->login($_POST['email'], $_POST['password']);
        break;

    case 'get_states':
        $response = $VT->get_states();
        break;

    case 'get_event_types':
        $response = $VT->get_event_types();
        break;

    case 'perform_search':
        $response = $VT->perform_search($_POST['stateCode'], $_POST['eventTypeID'], $_POST['sortBy'], $_POST['eventStatus']);
        break;

    case 'perform_inventory_search':
        $response = $VT->perform_inventory_search($_POST['eventID']);
        break;
    
    default:
        $response = json_encode([
            'result' => 'Unknown action specified',
        ]);
        break;

}

header('Content-Type: application/json');
die ($response);

