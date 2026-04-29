<?php

namespace App\GraphQL\Mutations;

use App\Models\Hospital;
use GraphQL\Type\Definition\ResolveInfo;
use Nuwave\Lighthouse\Exceptions\AuthorizationException;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class DeleteHospitalMutation
{
    public function __invoke(mixed $root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): bool
    {
        if ($context->user()->role !== 'admin') {
            throw new AuthorizationException('Only admins can delete hospitals.');
        }

        $hospital = Hospital::findOrFail($args['id']);
        $hospital->delete();

        return true;
    }
}
