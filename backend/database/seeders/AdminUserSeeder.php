<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@rifa.com'],
            [
                'name' => 'Administrador',
                'phone' => '11999999999',
                'password' => '12345678',
                'role' => 'admin',
            ]
        );

        $this->command->info('Admin criado com sucesso.');
    }
}