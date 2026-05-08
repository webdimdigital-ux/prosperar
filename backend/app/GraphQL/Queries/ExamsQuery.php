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
            $digits = preg_replace('/\D/', '', $search);
            $terms = array_values(array_filter(array_map('trim', explode(' ', $search))));
            $query->where(function (Builder $q) use ($search, $digits, $terms) {
                $q->where(function (Builder $sub) use ($terms) {
                    foreach ($terms as $term) {
                        $sub->where('name', 'like', "%{$term}%");
                    }
                })
                ->orWhereHas('client', fn ($sub) => $sub
                    ->where(function (Builder $inner) use ($terms) {
                        foreach ($terms as $term) {
                            $inner->where('name', 'like', "%{$term}%");
                        }
                    })
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('cpf', 'like', "%{$search}%")
                )
                ->orWhereHas('hospital', fn ($sub) => $sub->where('name', 'like', "%{$search}%"))
                ->orWhere('cpf', 'like', "%{$search}%");
                if ($digits !== '') {
                    $q->orWhereRaw("REGEXP_REPLACE(cpf, '[^0-9]', '') LIKE ?", ["%{$digits}%"]);
                }
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
