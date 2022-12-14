<?php 
use \VetTix\VetTix;

require_once('includes/vt-class.php');
$VT = new VetTix();
$VT->force_login();
if ( isset( $_POST['action']) ) {
    switch ( $_POST['action'] ) {
        case 'logout':
            $VT->logout();
            break;
        case 'search':
            $event_data = $VT->perform_search( $_POST['stateCode'], $_POST['eventTypeID'], $_POST['sortBy'], $_POST['eventStatus'] );
            break;
        case 'search_inventory':
            $inventory_response = $VT->perform_inventory_search( $_POST['eventID'], $_POST['ticketCount'] );
            break;
        default:
            die( 'Unknown action: '.$_POST['action'] );
    }
}

$event_types = $VT->get_event_types();
$states = $VT->get_states();

// Start content
$VT::get_header();
?>
  <div class="container-fluid" id="container-data">
    <div class="row">
        <div class="col-md-4">
            <div class=" text-center bg-dark bg-opacity-10 p-3 rounded mb-4">
                <h3>Logged in</h3>
                <form action="index.php" method="POST">
                    <input type="hidden" name="action" value="logout">
                    <button class="btn btn-primary" id="btn-clear-session" type="submit">Clear Session</button>
                </form>
            </div>
        </div>
        <div class="col-md-4">
            <div class="text-center bg-dark bg-opacity-10 p-3 rounded mb-4">
                <form method="POST" action="index.php">
                <input type="hidden" name="action" value="search">
                <select class="form-select mb-2" aria-label="Event Type" id="select-event-type" name="eventTypeID">
                    <option selected value="0">Any</option>
                <?php foreach( $event_types->list as $event_type ) { ?>
                    <option value="<?= htmlspecialchars( $event_type->ID ) ?>"><?= htmlspecialchars( $event_type->name ) ?></option>
                <?php } ?>
                </select>
                <select class="form-select mb-2" aria-label="Event State" id="select-event-state" name="stateCode">
                    <option selected value="">Any</option>
                <?php foreach( $states->list as $state ) { ?>
                    <option value="<?= htmlspecialchars( $state->code ) ?>">(<?= htmlspecialchars( $state->code )?>) <?= htmlspecialchars( $state->name ) ?></option>
                <?php } ?>
                </select>
                <select class="form-select mb-2" aria-label="Event Status" id="select-event-status" name="eventStatus">
                    <option value="all">All Events</option>
                    <option value="open">Open Events</option>
                    <option value="lottery">Events in Lottery</option>
                    <option value="fcfs">First Come ??? First Serve</option>
                </select>
                <select class="form-select mb-2" aria-label="Event Sort" id="select-event-sort" name="sortBy">
                    <option value="dateAscending">Event Date (Soonest)</option>
                    <option value="dateDescending">Event Date (Farthest)</option>
                    <option value="ticketsAvailableDescending">Most Tickets Available</option>
                    <option value="ticketsAvailableAscending">Least Tickets Available</option>
                    <option value="popularity">Most Popular</option>
                    <option value="titleAscending">Event Title (A-Z)</option>
                    <option value="titleDescending">Event Title (Z-A)</option>
                </select>
                <button class="btn btn-primary form-control" id="btn-search" type="submit">Search</button>
                </form>
            </div>
        </div>
        <div class="col-md-4">
            <div class="bg-dark bg-opacity-10 p-3 rounded mb-4">
                <form class="mb-2" action="index.php" method="POST">
                    <input type="hidden" name="action" value="search_inventory">
                    <span>Event ID</span>
                    <input id="inventory-event-id" class="form-control mb-2" type="number" placeholder="Event ID" name="eventID">
                    <span>How many tickets?</span>
                    <input id="inventory-tickets-wanted" class="form-control mb-2" type="number" placeholder="Ticket count" name="ticketCount" min="1" max="10">
                    <button class="btn btn-primary form-control" id="btn-search-inventory" type="submit">Search Inventory</button>
                </form>

                <?php if (isset($inventory_response)) { ?>
                    <pre><?= htmlspecialchars($inventory_response) ?></pre>
                <?php } ?>
            </div>
        </div>
        <div class="col-md-12">
            <div class="table-responsive">
                <table class="table table-dark table-striped table-bordered table-hover table-responsive" id="table-events">
                    <thead class="thead-dark">
                        <tr>
                            <th scope="col">Image</th>
                            <th scope="col">Event ID</th>
                            <th scope="col">Title</th>
                            <th scope="col">Event Type</th>
                            <th scope="col">Tickets Available</th>
                            <th scope="col">Date</th>
                            <th scope="col">Time</th>
                        </tr>
                    </thead>
                    <tbody id="table-event-data">
                    <?php 
                        if (isset($event_data)) {
                            foreach( $event_data->eventItems as $event ) {
                    ?>
                        <tr>
                            <td><img src="<?= $event->imageURL ?>" class="img-thumb"></td>
                            <td><?= $event->ID ?></td>
                            <td><?=  $event->title ?></td>
                            <td><?= $event->eventType->name ?></td>
                            <td><?= $event->ticketsAvailable ?></td>
                            <td><?= $event->startDate ?></td>
                            <td><?= $event->startTime ?></td>
                        </tr>
                    <?php
                            }
                        }
                    ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  </div>
<?php
$VT::get_footer();
