<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Raffle extends Model
{
    protected $fillable = [
        'title',
        'description',
        'price_per_number',
        'total_numbers',
        'draw_date',
        'status',
        'banner',
    ];

    public function prizes()
    {
        return $this->hasMany(Prize::class);
    }

    public function purchases()
    {
        return $this->hasMany(Purchase::class);
    }

    public function numbers()
    {
        return $this->hasMany(RaffleNumber::class);
    }
}