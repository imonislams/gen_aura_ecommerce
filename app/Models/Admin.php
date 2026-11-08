<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Admin extends Model
{
    protected $fillable = ['name', 'username', 'password', 'must_change_password'];
    protected $hidden = ['password'];
    protected $casts = ['password' => 'hashed', 'must_change_password' => 'boolean'];
}
