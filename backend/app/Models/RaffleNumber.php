<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RaffleNumber extends Model
{
    protected $fillable = [
        'raffle_id',
        'number',
        'status',
        'order_id',
        'customer_user_id',
        'assigned_at',
    ];

    protected function casts(): array
    {
        return [
            'assigned_at' => 'datetime',
        ];
    }

    public function raffle()
    {
        return $this->belongsTo(Raffle::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_user_id');
    }
}