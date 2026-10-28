<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('analytics_events', function (Blueprint $table) {
            $table->id();
            $table->uuid('event_id')->unique();
            $table->string('event_name', 100);
            $table->string('source', 20);
            $table->string('anonymous_id', 64)->nullable();
            $table->string('session_id', 64)->nullable();
            $table->string('user_id', 100)->nullable();
            $table->timestamp('occurred_at');
            $table->timestamp('received_at')->useCurrent();
            $table->text('page_url')->nullable();
            $table->string('page_title', 255)->nullable();
            $table->text('referrer')->nullable();
            $table->json('properties')->nullable();
            $table->timestamps();

            $table->index(['occurred_at', 'event_name']);
            $table->index(['event_name', 'occurred_at']);
            $table->index(['anonymous_id', 'occurred_at']);
            $table->index(['session_id', 'occurred_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analytics_events');
    }
};
