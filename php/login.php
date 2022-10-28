<?php 
require_once('includes/vt-class.php');
$VT = new VetTix();
if ($VT->current_token() !== NULL) {
    header('Location: index.php');
    die();
}

//Check if login posted
if (isset($_POST['email'])) {
    $login_output = $VT->login($_POST['email'], $_POST['apikey']);
}

//Start content
$VT->get_header();
?>
<div class="container" id="container-login">
    <div class="row">
        <div class="col-md-4 offset-md-4 text-center bg-dark bg-opacity-10 p-3 rounded ">
            <h3>Login</h3>
            <form action="login.php" method="POST"> 
                <input class="form-control mb-4" type="email" id="email" name="email" value="" placeholder="Email">
                <input class="form-control mb-4" type="text" id="apikey" name="apikey" value="bSgpYBN5iW2UFWDVJ2DTsdwujioSO" placeholder="API Key">
                <button class="btn btn-primary" id="btn-login" type="submit">Login</button>
            </form>
            <?php if (isset($login_output)) echo $login_output->errorCode; ?>
        </div>
    </div>
</div>
<?php
$VT->get_footer();
