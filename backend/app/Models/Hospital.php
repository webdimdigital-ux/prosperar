<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Hospital extends Model
{
    protected $fillable = [
        'name', 'cnpj', 'address', 'city', 'state',
        'phone', 'email', 'status',
    ];

    public function exams(): HasMany
    {
        return $this->hasMany(Exam::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
