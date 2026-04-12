<?php

namespace App\GraphQL\Mutations;

use App\Models\Hospital;
use App\Models\User;
use GraphQL\Type\Definition\ResolveInfo;
use Illuminate\Support\Facades\Hash;
use Nuwave\Lighthouse\Exceptions\AuthorizationException;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class CreateHospitalMutation
{
    public function __invoke(mixed $root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): Hospital
    {
        if ($context->user()->role !== 'admin') {
            throw new AuthorizationException('Only admins can create hospitals.');
        }

        $input = $args['input'];
        $password = $input['password'] ?? null;
        unset($input['password']);

        $hospital = Hospital::create($input);

        if ($password && !empty($hospital->email)) {
            User::create([
                'name'        => $hospital->name,
                'email'       => $hospital->email,
                'cpf'         => preg_replace('/\D/', '', $hospital->cnpj),
                'password'    => Hash::make($password),
                'role'        => 'hospital',
                'hospital_id' => $hospital->id,
                'status'      => 'active',
            ]);
        }

        return $hospital;
    }
}
