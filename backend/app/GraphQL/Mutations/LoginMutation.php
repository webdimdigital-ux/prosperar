<?php

namespace App\GraphQL\Mutations;

use App\Models\User;
use GraphQL\Type\Definition\ResolveInfo;
use Illuminate\Support\Facades\Hash;
use Nuwave\Lighthouse\Exceptions\AuthenticationException;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class LoginMutation
{
    public function __invoke(mixed $root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): array
    {
        /** @var User|null $user */
        $user = User::where('email', $args['email'])->first();

        if (! $user || ! Hash::check($args['password'], $user->password)) {
            throw new AuthenticationException('Invalid credentials.');
        }

        if ($user->status !== 'active') {
            throw new AuthenticationException('Account is inactive.');
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return ['token' => $token, 'user' => $user];
    }
}
