<?php

namespace App\GraphQL\Mutations;

use App\Models\Exam;
use GraphQL\Type\Definition\ResolveInfo;
use Illuminate\Support\Facades\Storage;
use Nuwave\Lighthouse\Exceptions\AuthorizationException;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class DeleteExamMutation
{
    public function __invoke(mixed $root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): bool
    {
        if ($context->user()->role !== 'admin') {
            throw new AuthorizationException('Only admins can delete exams.');
        }

        $exam = Exam::findOrFail($args['id']);

        if (Storage::disk('local')->exists($exam->file_path)) {
            Storage::disk('local')->delete($exam->file_path);
        }

        $exam->delete();

        return true;
    }
}
