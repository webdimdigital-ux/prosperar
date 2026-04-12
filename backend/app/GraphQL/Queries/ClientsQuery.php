<?php

namespace App\GraphQL\Queries;

use App\Models\User;
use GraphQL\Type\Definition\ResolveInfo;
use Illuminate\Database\Eloquent\Builder;
use Nuwave\Lighthouse\Exceptions\AuthorizationException;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class ClientsQuery
{
    public function __invoke(mixed $root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): Builder
    {
        $user = $context->user();

        if (! in_array($user->role, ['admin', 'hospital'])) {
            throw new AuthorizationException('Unauthorized.');
        }

        $query = User::query()->where('role', 'client');

        if ($user->role === 'hospital') {
            // Only clients that have exams from this hospital
            $query->whereHas('exams', fn ($q) => $q->where('hospital_id', $user->hospital_id));
        }

        if (! empty($args['search'])) {
            $search = $args['search'];
            $query->where(function (Builder $q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('cpf', 'like', "%{$search}%");
            });
        }

        if (! empty($args['filter']['status'])) {
            $query->where('status', $args['filter']['status']);
        }

        if (! empty($args['sort'])) {
            $sort = $args['sort'];
            $allowed = ['name', 'email', 'created_at'];
            $column = in_array($sort['column'] ?? '', $allowed) ? $sort['column'] : 'name';
            $order = ($sort['order'] ?? 'ASC') === 'DESC' ? 'DESC' : 'ASC';
            $query->orderBy($column, $order);
        } else {
            $query->orderBy('name');
        }

        return $query;
    }
}
