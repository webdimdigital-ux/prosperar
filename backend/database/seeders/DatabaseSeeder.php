<?php

namespace Database\Seeders;

use App\Models\Hospital;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $hospital = Hospital::create([
            'name' => 'Hospital Exemplo',
            'cnpj' => '12345678000100',
            'city' => 'São Paulo',
            'state' => 'SP',
            'status' => 'active',
        ]);

        User::create([
            'name' => 'Admin',
            'email' => 'admin@prosperar.com',
            'cpf' => '00000000000',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        User::create([
            'name' => 'Hospital User',
            'email' => 'hospital@prosperar.com',
            'cpf' => '11111111111',
            'password' => Hash::make('password'),
            'role' => 'hospital',
            'hospital_id' => $hospital->id,
            'status' => 'active',
        ]);

        User::create([
            'name' => 'Client User',
            'email' => 'client@prosperar.com',
            'cpf' => '22222222222',
            'password' => Hash::make('password'),
            'role' => 'client',
            'status' => 'active',
        ]);
    }
}
