<?php

require_once('../includes/vt-class.php');

use App\VetTix;

$VT = new VetTix();

/**
 * Default response if $_POST['action'] is empty
 */
if (!isset($_POST['action'])) {

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
switch ($_POST['action']) {

    case 'login':
        $response = $VT->login($_POST['email'], $_POST['password']);
        break;

    case 'state':
        $response = $VT->get_states();
        break;

    case 'event_types':
        $response = $VT->get_event_types();
        break;

    case 'event':
        $response = $VT->perform_search($_POST['stateCode'], $_POST['eventTypeID'], $_POST['sortBy'], $_POST['eventStatus']);
        break;

    case 'inventory':
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

