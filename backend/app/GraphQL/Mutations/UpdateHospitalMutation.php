<?php

namespace App\GraphQL\Mutations;

use App\Models\Hospital;
use App\Models\User;
use GraphQL\Type\Definition\ResolveInfo;
use Illuminate\Support\Facades\Hash;
use Nuwave\Lighthouse\Exceptions\AuthorizationException;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class UpdateHospitalMutation
{
    public function __invoke(mixed $root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): Hospital
    {
        if ($context->user()->role !== 'admin') {
            throw new AuthorizationException('Only admins can update hospitals.');
        }

        $input = $args['input'];
        $password = $input['password'] ?? null;
        unset($input['password']);

        $hospital = Hospital::findOrFail($args['id']);
        $hospital->update($input);

        // Atualiza email/senha do usuário vinculado
        $hospitalUser = User::where('hospital_id', $hospital->id)->where('role', 'hospital')->first();

        if ($hospitalUser) {
            $userUpdate = [];
            if (!empty($hospital->email)) $userUpdate['email'] = $hospital->email;
            if (!empty($hospital->name))  $userUpdate['name']  = $hospital->name;
            if ($password)                $userUpdate['password'] = Hash::make($password);
            if (!empty($userUpdate)) $hospitalUser->update($userUpdate);
        } elseif ($password && !empty($hospital->email)) {
            // Cria usuário se ainda não existe
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
