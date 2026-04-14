<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('raffles', function (Blueprint $table) {
            $table->id();

            $table->foreignId('created_by_user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('title');
            $table->string('slug')->unique();
            $table->string('subtitle')->nullable();
            $table->longText('description')->nullable();

            $table->string('instagram_url')->nullable();
            $table->string('banner_path')->nullable();
            $table->string('logo_path')->nullable();

            $table->unsignedInteger('total_numbers');
            $table->decimal('price_per_ticket', 10, 2);

            $table->string('status', 20)->default('draft');

            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamp('draw_at')->nullable();

            $table->json('design')->nullable();

            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('raffles');
    }
};