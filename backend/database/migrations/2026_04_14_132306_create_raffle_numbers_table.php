<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('raffle_numbers', function (Blueprint $table) {
            $table->id();

            $table->foreignId('raffle_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('number');
            $table->string('status', 20)->default('available');

            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('customer_user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamp('assigned_at')->nullable();

            $table->timestamps();

            $table->unique(['raffle_id', 'number']);
            $table->index(['raffle_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('raffle_numbers');
    }
};