<?php

namespace App\Services;

use App\Models\Raffle;
use App\Models\RaffleNumber;

class GenerateRaffleNumbersService
{
    public function handle(Raffle $raffle): void
    {
        if ($raffle->numbers()->exists()) {
            return;
        }

        $rows = [];
        $now = now();

        for ($i = 1; $i <= $raffle->total_numbers; $i++) {
            $rows[] = [
                'raffle_id' => $raffle->id,
                'number' => $i,
                'status' => 'available',
                'created_at' => $now,
                'updated_at' => $now,
            ];

            if (count($rows) === 1000) {
                RaffleNumber::insert($rows);
                $rows = [];
            }
        }

        if (!empty($rows)) {
            RaffleNumber::insert($rows);
        }
    }
}