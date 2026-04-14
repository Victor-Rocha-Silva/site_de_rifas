<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RafflePrize extends Model
{
    protected $fillable = [
        'raffle_id',
        'title',
        'description',
        'image_path',
        'sort_order',
    ];

    public function raffle()
    {
        return $this->belongsTo(Raffle::class);
    }
}