<?php

namespace App\GraphQL\Mutations;

use GraphQL\Type\Definition\ResolveInfo;
use Illuminate\Support\Facades\Password;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class ResetPasswordMutation
{
    public function __invoke(mixed $root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): bool
    {
        $input = $args['input'];

        $status = Password::reset(
            [
                'email' => $input['email'],
                'password' => $input['password'],
                'password_confirmation' => $input['password_confirmation'],
                'token' => $input['token'],
            ],
            function ($user, $password) {
                $user->forceFill(['password' => $password])->save();
            }
        );

        return $status === Password::PASSWORD_RESET;
    }
}
