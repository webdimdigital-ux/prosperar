<?php

namespace App\GraphQL\Mutations;

use App\Models\User;
use GraphQL\Type\Definition\ResolveInfo;
use Nuwave\Lighthouse\Exceptions\AuthorizationException;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class DeleteClientMutation
{
    public function __invoke(mixed $root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): bool
    {
        if ($context->user()->role !== 'admin') {
            throw new AuthorizationException('Only admins can delete clients.');
        }

        $client = User::where('id', $args['id'])->where('role', 'client')->firstOrFail();
        $client->delete();

        return true;
    }
}
