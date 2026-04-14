<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

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

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'paid_at' => 'datetime',
            'unit_price' => 'decimal:2',
            'total_amount' => 'decimal:2',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Order $order) {
            if (empty($order->public_id)) {
                $order->public_id = (string) Str::uuid();
            }
        });
    }

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