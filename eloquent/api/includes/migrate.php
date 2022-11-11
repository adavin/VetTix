<?php 

require_once('vt-class.php');

use App\VetTix;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

$vt = new VetTix();

class CreateUserLogin extends Migration
{
    protected $vt;

    /**
     * 
     */
    public function __construct($vt){
        $this->vt = $vt;
    }

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $this->vt->mgr::schema()->create('user_logins', function (Blueprint $table) {

            $table->id();
            $table->string('email', 100);
            $table->string('token', 255);
            $table->timestamps();

        });

    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {

        $this->vt->mgr::schema()->dropIfExists('user_logins');

    }

    /**
     * return default response to user
     *
     * @param [type] $a
     * @return void
     */
    public function no_action($a) {
    
        header('Content-Type: application/json');
        $result = json_encode(['result' => 'No action specified', 'argv' => $a]);
        die($result);
    }
}

$cul = new CreateUserLogin($vt);


if (!isset($argv[1]))
    $cul->no_action($argv);

switch ($argv[1]) {

    case 'up':
        $cul->up();
        $response = 'Migrate up.';
        break;

    case 'down':
        $cul->down();
        $response = 'Migrate down';
        break;

    default:
        $cul->no_action($argv);
        break;
    
}

$result = json_encode(['result' => $response]);
die($result);


/*
$models = glob( __DIR__ . '/../models/*.php');
foreach ($models as $model) {
    echo "$model \n";
    require_once($model);   
}
*/
