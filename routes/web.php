<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\QuizController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [QuizController::class, 'index'])->name('dashboard');
    Route::post('quizzes', [QuizController::class, 'store'])->name('quizzes.store');
    Route::delete('quizzes/{id}', [QuizController::class, 'destroy'])->name('quizzes.destroy');
    Route::post('quizzes/{quiz}/import-terms', [QuizController::class, 'importTerms'])->name('quizzes.terms.import');
    Route::put('quizzes/{id}', [QuizController::class, 'update'])->name('quizzes.update');

    Route::get('quizzes/{id}', [QuizController::class, 'show'])->name('quizzes.show');
    Route::get('quizzes/{id}/edit', [QuizController::class, 'edit'])->name('quizzes.edit');

    Route::post('quizzes/{quiz}/terms', [QuizController::class, 'addTerm'])->name('quizzes.terms.store');
    Route::get('quizzes/{quiz}/learn', [QuizController::class, 'learn'])->name('quizzes.learn');
    Route::delete('terms/{term}', [QuizController::class, 'deleteTerm'])->name('terms.destroy');

    Route::get('quizzes/{quiz}/edit', [QuizController::class, 'edit'])->name('quizzes.edit');
    Route::get('quizzes/{quiz}/flashcards', [QuizController::class, 'flashcards'])->name('quizzes.flashcards');
    Route::get('quizzes/{quiz}/learn-session', [QuizController::class, 'learnSession'])->name('quizzes.learn.session');
    Route::get('quizzes/{quiz}/test', [QuizController::class, 'test'])->name('quizzes.test');
    Route::get('quizzes/{quiz}/test-session', [QuizController::class, 'testSession'])->name('quizzes.test.session');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
