<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'public_id',
        'raffle_id',
        'customer_user_id',
        'quantity',
        'unit_price',
        'total_amount',
        'status',
        'payment_provider',
        'payment_reference',
        'payment_id',
        'checkout_url',
        'paid_at',
        'metadata',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function raffle()
    {
        return $this->belongsTo(Raffle::class);
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_user_id');
    }

    public function numbers()
    {
        return $this->hasMany(RaffleNumber::class);
    }
}