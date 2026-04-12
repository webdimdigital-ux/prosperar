<?php

namespace App\GraphQL\Mutations;

use App\Services\PdfExamService;
use GraphQL\Type\Definition\ResolveInfo;
use Nuwave\Lighthouse\Exceptions\AuthorizationException;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class UploadExamMutation
{
    public function __construct(private PdfExamService $pdfService) {}

    public function __invoke(mixed $root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): array
    {
        $user = $context->user();

        if ($user->role !== 'admin') {
            throw new AuthorizationException('Only admins can upload exams.');
        }

        $input = $args['input'];

        return $this->pdfService->process(
            file: $input['file'],
            hospitalId: $input['hospital_id'],
            examDate: $input['exam_date'],
            observations: $input['observations'] ?? null,
            uploadedBy: $user->id,
        );
    }
}
