<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = ['order_number', 'customer_name', 'items', 'total', 'status'];

    protected function casts(): array
    {
        return [
            'items' => 'array',
            'total' => 'integer',
        ];
    }
}
