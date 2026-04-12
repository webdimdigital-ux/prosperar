<?php

namespace App\GraphQL\Mutations;

use App\Models\Exam;
use App\Models\User;
use GraphQL\Type\Definition\ResolveInfo;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Nuwave\Lighthouse\Exceptions\AuthorizationException;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class CreateClientMutation
{
    public function __invoke(mixed $root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): User
    {
        if ($context->user()->role !== 'admin') {
            throw new AuthorizationException('Only admins can create clients.');
        }

        $input = $args['input'];

        $validator = Validator::make($input, [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'cpf' => 'required|string|unique:users,cpf',
            'password' => 'required|min:8',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'cpf' => $input['cpf'],
            'phone' => $input['phone'] ?? null,
            'birth_date' => $input['birth_date'] ?? null,
            'password' => $input['password'],
            'hospital_id' => $input['hospital_id'] ?? null,
            'role' => 'client',
            'status' => $input['status'] ?? 'active',
        ]);

        Exam::where('cpf', $user->cpf)->whereNull('client_id')->update(['client_id' => $user->id]);

        return $user;
    }
}
