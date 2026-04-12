<?php

namespace App\GraphQL\Queries;

use App\Models\Exam;
use GraphQL\Type\Definition\ResolveInfo;
use Illuminate\Database\Eloquent\Builder;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class ExamsQuery
{
    public function __invoke(mixed $root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): Builder
    {
        $user = $context->user();
        $query = Exam::query()->with(['client', 'hospital', 'uploadedBy']);

        if ($user->role === 'client') {
            $query->whereRaw("
            REGEXP_REPLACE(cpf, '[^0-9]', '') = ?
        ", [preg_replace('/\D/', '', $user->cpf)]);

        } elseif ($user->role === 'hospital') {
            $query->where('hospital_id', $user->hospital_id);
        }
        // admin sees all

        if (! empty($args['search'])) {
            $search = $args['search'];
            $query->where(function (Builder $q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhereHas('client', fn ($q) => $q->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('hospital', fn ($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        if (! empty($args['filter'])) {
            $filter = $args['filter'];
            if (isset($filter['status'])) {
                $query->where('status', $filter['status']);
            }
            if (isset($filter['hospital_id'])) {
                $query->where('hospital_id', $filter['hospital_id']);
            }
            if (isset($filter['date_from'])) {
                $query->where('exam_date', '>=', $filter['date_from']);
            }
            if (isset($filter['date_to'])) {
                $query->where('exam_date', '<=', $filter['date_to']);
            }
        }

        if (! empty($args['sort'])) {
            $sort = $args['sort'];
            $allowed = ['name', 'exam_date', 'status', 'created_at'];
            $column = in_array($sort['column'] ?? '', $allowed) ? $sort['column'] : 'created_at';
            $order = ($sort['order'] ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';
            $query->orderBy($column, $order);
        } else {
            $query->orderByDesc('created_at');
        }

        return $query;
    }
}
