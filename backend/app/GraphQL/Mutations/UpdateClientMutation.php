<?php

namespace App\GraphQL\Mutations;

use App\Models\User;
use GraphQL\Type\Definition\ResolveInfo;
use Illuminate\Support\Facades\Hash;
use Nuwave\Lighthouse\Exceptions\AuthorizationException;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class UpdateClientMutation
{
    public function __invoke(mixed $root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): User
    {
        if ($context->user()->role !== 'admin') {
            throw new AuthorizationException('Only admins can update clients.');
        }

        $user = User::findOrFail($args['id']);
        $input = array_filter($args['input'], fn ($v) => $v !== null);
        if (isset($input['password'])) {
            $input['password'] = Hash::make($input['password']);
        }
        $user->update($input);

        return $user;
    }
}
