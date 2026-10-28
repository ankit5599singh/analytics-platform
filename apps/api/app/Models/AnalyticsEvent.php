<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnalyticsEvent extends Model
{
    protected $fillable = ['event_id', 'event_name', 'source', 'anonymous_id', 'session_id', 'user_id', 'occurred_at', 'received_at', 'page_url', 'page_title', 'referrer', 'properties'];

    protected function casts(): array
    {
        return [
            'occurred_at' => 'immutable_datetime',
            'received_at' => 'immutable_datetime',
            'properties' => 'array',
        ];
    }
}
