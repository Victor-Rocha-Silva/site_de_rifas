<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Raffle extends Model
{
    protected $fillable = [
        'created_by_user_id',
        'title',
        'slug',
        'subtitle',
        'description',
        'instagram_url',
        'banner_path',
        'logo_path',
        'total_numbers',
        'price_per_ticket',
        'status',
        'starts_at',
        'ends_at',
        'draw_at',
        'design',
    ];

    protected function casts(): array
    {
        return [
            'design' => 'array',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'draw_at' => 'datetime',
            'price_per_ticket' => 'decimal:2',
        ];
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function prizes()
    {
        return $this->hasMany(RafflePrize::class)->orderBy('sort_order');
    }

    public function numbers()
    {
        return $this->hasMany(RaffleNumber::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}