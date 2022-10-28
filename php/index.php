<?php 
require_once('includes/vt-class.php');
$VT = new VetTix();
$VT->forceLogin();
if (isset($_POST['action'])) {
    switch ($_POST['action']) {
        case 'logout':
            $VT->logout();
            die('done');
            break;
        default:
            die('Unknown action: '.$_POST['action']);
    }
}
// Start content
$VT->get_header();
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
                <select class="form-select mb-2" aria-label="Event Type" id="select-event-type">
                    <option selected value="0">Any</option>
                </select>
                <select class="form-select mb-2" aria-label="Event State" id="select-event-state">
                    <option selected value="">Any</option>
                </select>
                <select class="form-select mb-2" aria-label="Event Status" id="select-event-status"></select>
                <select class="form-select mb-2" aria-label="Event Sort" id="select-event-sort"></select>
                <button class="btn btn-primary form-control" id="btn-search">Search</button>
            </div>
        </div>
        <div class="col-md-4">
            <div class="bg-dark bg-opacity-10 p-3 rounded mb-4">
                <span>Event ID</span>
                <input id="inventory-event-id" class="form-control mb-2" type="number" placeholder="Event ID">
                <span>How many tickets?</span>
                <input id="inventory-tickets-wanted" class="form-control mb-2" type="number" placeholder="Ticket count">
                <button class="btn btn-primary form-control" id="btn-search-inventory">Search Inventory</button>
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
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  </div>
<?php
$VT->get_footer();
