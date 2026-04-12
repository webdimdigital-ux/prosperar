<?php

namespace App\GraphQL\Mutations;

use App\Models\User;
use App\Notifications\WelcomeNotification;
use GraphQL\Type\Definition\ResolveInfo;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class RegisterMutation
{
    public function __invoke(mixed $root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): User
    {
        $input = $args['input'];

        $validator = Validator::make($input, [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'cpf' => 'required|string|unique:users,cpf',
            'password' => 'required|min:8|confirmed',
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
            'role' => 'client',
            'status' => 'active',
        ]);

        // Link any unmatched exams that already have this CPF
        \App\Models\Exam::where('cpf', $user->cpf)
            ->whereNull('client_id')
            ->update(['client_id' => $user->id]);

        $user->notify(new WelcomeNotification());

        return $user;
    }
}
