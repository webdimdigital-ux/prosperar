<?php

namespace App\GraphQL\Queries;

use App\Models\Hospital;
use GraphQL\Type\Definition\ResolveInfo;
use Illuminate\Database\Eloquent\Builder;
use Nuwave\Lighthouse\Exceptions\AuthorizationException;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class HospitalsQuery
{
    public function __invoke(mixed $root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): Builder
    {
        $user = $context->user();

        if ($user->role !== 'admin') {
            throw new AuthorizationException('Only admins can list hospitals.');
        }

        $query = Hospital::query();

        if (! empty($args['search'])) {
            $search = $args['search'];
            $query->where(function (Builder $q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('cnpj', 'like', "%{$search}%");
            });
        }

        if (! empty($args['filter']['status'])) {
            $query->where('status', $args['filter']['status']);
        }

        if (! empty($args['sort'])) {
            $sort = $args['sort'];
            $allowed = ['name', 'city', 'created_at'];
            $column = in_array($sort['column'] ?? '', $allowed) ? $sort['column'] : 'name';
            $order = ($sort['order'] ?? 'ASC') === 'DESC' ? 'DESC' : 'ASC';
            $query->orderBy($column, $order);
        } else {
            $query->orderBy('name');
        }

        return $query;
    }
}
