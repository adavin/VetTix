<?php
/*******************************************************
 * 
 * 
 *     models.php
 * 
 * Contains the database models for Eloquent
 * 
 * Each model would typically be placed in a separate
 * class file
 * 
 * 
 *******************************************************/

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserLogin extends Model 
{
    
    protected $fillable = ['email', 'token'];

}

class FailedLogin extends Model 
{

    protected $fillable = ['email', 'password'];

}