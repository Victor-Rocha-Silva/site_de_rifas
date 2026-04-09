<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RaffleNumber extends Model
{
    protected $fillable = [
        'raffle_id',
        'number',
        'status',
        'purchase_id',
    ];

    public function raffle()
    {
        return $this->belongsTo(Raffle::class);
    }

    public function purchase()
    {
        return $this->belongsTo(Purchase::class);
    }
}