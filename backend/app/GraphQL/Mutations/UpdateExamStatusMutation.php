<?php

namespace App\GraphQL\Mutations;

use App\Models\Exam;
use GraphQL\Type\Definition\ResolveInfo;
use Nuwave\Lighthouse\Exceptions\AuthorizationException;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class UpdateExamStatusMutation
{
    public function __invoke(mixed $root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): Exam
    {
        $user = $context->user();

        if ($user->role !== 'admin') {
            throw new AuthorizationException('Only admins can update exam status.');
        }

        $exam = Exam::findOrFail($args['id']);
        $exam->update(['status' => $args['status']]);

        return $exam;
    }
}
