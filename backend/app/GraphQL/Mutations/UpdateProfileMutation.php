<?php

namespace App\GraphQL\Mutations;

use App\Models\User;
use GraphQL\Type\Definition\ResolveInfo;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class UpdateProfileMutation
{
    public function __invoke(mixed $root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): User
    {
        /** @var User $user */
        $user = $context->user();
        $input = $args['input'];

        if (! empty($input['password'])) {
            $validator = Validator::make($input, [
                'password' => 'required|min:8|confirmed',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }
        }

        $user->update(array_filter([
            'name' => $input['name'] ?? null,
            'phone' => $input['phone'] ?? null,
            'password' => ! empty($input['password']) ? $input['password'] : null,
        ], fn ($v) => $v !== null));

        return $user->fresh();
    }
}
