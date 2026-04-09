<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
    protected $fillable = [
        'raffle_id',
        'buyer_name',
        'buyer_phone',
        'buyer_email',
        'quantity',
        'unit_price',
        'total_price',
        'payment_status',
        'payment_gateway',
        'payment_reference',
    ];

    public function raffle()
    {
        return $this->belongsTo(Raffle::class);
    }

    public function numbers()
    {
        return $this->hasMany(RaffleNumber::class);
    }
}