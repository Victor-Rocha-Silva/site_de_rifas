<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Prize extends Model
{
    protected $fillable = [
        'raffle_id',
        'title',
        'description',
        'position',
        'estimated_cost',
    ];

    public function raffle()
    {
        return $this->belongsTo(Raffle::class);
    }
}