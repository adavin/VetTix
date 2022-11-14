<?php 
/*******************************************************
 * 
 * 
 *     migrate.php
 * 
 * Custom migration file for creating database schema
 * 
 * Usage:
 *      php migrate.php up      <- creates sql schema
 *      php migrate.php down    <- deletes sql schema
 * 
 * 
 *******************************************************/

require_once('vt-class.php');

use App\VetTix;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class MigrationActions extends Migration
{
    protected $vt;

    /**
     * 
     */
    public function __construct($vt)
    {
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

        $this->vt->mgr::schema()->create('failed_logins', function (Blueprint $table) {

            $table->id();
            $table->string('email', 100);
            $table->string('password', 255);
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

        $this->vt->mgr::schema()->dropIfExists('failed_logins');

    }

    /**
     *  Invalid usage 
     *  return default response to user
     *
     * @param [type] $a
     * @return void
     */
    public function no_action($a) 
    {
    
        header('Content-Type: application/json');
        $result = json_encode(['result' => 'No action specified', 'argv' => $a]);
        die($result);
    }
}

/**
 * 
 */
$vt = new VetTix();

$ma = new MigrationActions($vt);


if (!isset($argv[1]))
    $cul->no_action($argv);

switch ($argv[1]) 
{

    case 'up':
        $ma->up();
        $response = 'Migrate up';
        break;

    case 'down':
        $ma->down();
        $response = 'Migrate down';
        break;

    default:
        $ma->no_action($argv);
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
