<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class IsDelivery
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user() || !$request->user()->isDelivery()) {
            return response()->json(['message' => 'Access denied. Delivery workers only.'], 403);
        }
        return $next($request);
    }
}
