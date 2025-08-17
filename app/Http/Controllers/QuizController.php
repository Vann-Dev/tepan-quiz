<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\Quiz;

class QuizController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $quizzes = Quiz::where('user_id', $user->id)->latest()->get();
        return Inertia::render('dashboard', [
            'quizzes' => $quizzes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $request->user()->quizzes()->create($validated);

        return redirect()->back()->with('success', 'Quiz created successfully!');
    }

    public function destroy(Request $request, $id)
    {
        $quiz = Quiz::findOrFail($id);
        if ($quiz->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }
        $quiz->delete();
        return redirect()->back()->with('success', 'Quiz deleted successfully!');
    }

    public function show($id)
    {
        $quiz = Quiz::findOrFail($id);
        return Inertia::render('quiz', [
            'quizId' => $quiz->id,
            'title' => $quiz->title,
            'description' => $quiz->description,
            'terms' => $quiz->terms->map(function ($term) {
                return [
                    'id' => $term->id,
                    'term' => $term->term,
                    'definition' => $term->definition,
                ];
            }),
        ]);
    }

    public function addTerm(Request $request, $quizId)
    {
        $quiz = Quiz::findOrFail($quizId);
        if ($quiz->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }
        $validated = $request->validate([
            'term' => 'required|string|max:255',
            'definition' => 'required|string',
        ]);
        $quiz->terms()->create($validated);
        return redirect()->back()->with('success', 'Term added successfully!');
    }

    public function edit(Request $request, $quizId)
    {
        $quiz = Quiz::with('terms')->findOrFail($quizId);
        if ($quiz->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }
        return Inertia::render('quiz-edit', [
            'quizId' => $quiz->id,
            'title' => $quiz->title,
            'description' => $quiz->description,
            'terms' => $quiz->terms->map(function ($term) {
                return [
                    'id' => $term->id,
                    'term' => $term->term,
                    'definition' => $term->definition,
                ];
            }),
        ]);
    }

    public function update(Request $request, $id)
    {
        $quiz = Quiz::findOrFail($id);
        if ($quiz->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);
        $quiz->update($validated);
        return redirect()->back()->with('success', 'Quiz updated successfully!');
    }

    public function deleteTerm(Request $request, $termId)
    {
        $term = \App\Models\Term::findOrFail($termId);
        $quiz = $term->quiz;
        if ($quiz->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }
        $term->delete();
        return redirect()->back()->with('success', 'Term deleted successfully!');
    }

    public function importTerms(Request $request, $quizId)
    {
        $quiz = Quiz::findOrFail($quizId);
        if ($quiz->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }
        $validated = $request->validate([
            'bulk' => 'required|string',
            'fieldSeparator' => 'required|string',
            'lineSeparator' => 'required|string',
        ]);
        $lineSep = $validated['lineSeparator'];
        $fieldSep = $validated['fieldSeparator'];
        // Normalize line endings for \n and \r\n
        $bulk = str_replace(["\r\n", "\r"], "\n", $validated['bulk']);
        if ($lineSep === "\\n") {
            $lines = explode("\n", $bulk);
        } elseif ($lineSep === "\\n\\n") {
            $lines = preg_split('/\n{2,}/', $bulk);
        } else {
            $lines = explode($lineSep, $bulk);
        }
        $terms = [];
        foreach ($lines as $line) {
            $parts = explode($fieldSep, $line, 2);
            if (count($parts) === 2) {
                $terms[] = [
                    'term' => trim($parts[0]),
                    'definition' => trim($parts[1]),
                ];
            }
        }
        foreach ($terms as $term) {
            if ($term['term'] && $term['definition']) {
                $quiz->terms()->create($term);
            }
        }
        return redirect()->back()->with('success', 'Terms imported successfully!');
    }

    public function flashcards(Request $request, $quizId)
    {
        $quiz = Quiz::with('terms')->findOrFail($quizId);
        if ($quiz->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }
        return Inertia::render('quiz-flashcards', [
            'quizId' => $quiz->id,
            'title' => $quiz->title,
            'terms' => $quiz->terms->map(function ($term) {
                return [
                    'id' => $term->id,
                    'term' => $term->term,
                    'definition' => $term->definition,
                ];
            }),
        ]);
    }

    public function learn(Request $request, $quizId)
    {
        $quiz = Quiz::with('terms')->findOrFail($quizId);
        if ($quiz->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }
        return Inertia::render('quiz-learn', [
            'quizId' => $quiz->id,
            'title' => $quiz->title,
            'description' => $quiz->description,
            'terms' => $quiz->terms->map(function ($term) {
                return [
                    'id' => $term->id,
                    'term' => $term->term,
                    'definition' => $term->definition,
                ];
            }),
        ]);
    }

    public function learnSession(Request $request, $quizId)
    {
        $quiz = Quiz::with('terms')->findOrFail($quizId);
        if ($quiz->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }
        $terms = $quiz->terms;
        if ($terms->count() < 2) {
            return response()->json(['error' => 'Not enough terms for a learn session.'], 400);
        }

        $questions = $terms->map(function ($term) use ($terms) {
            // Get other terms for wrong answers
            $otherTerms = $terms->where('id', '!=', $term->id)->shuffle()->take(3);
            $choices = collect([$term->definition])
                ->merge($otherTerms->pluck('definition'))
                ->shuffle()
                ->values();
            return [
                'termId' => $term->id,
                'term' => $term->term,
                'choices' => $choices,
                'answer' => $term->definition,
            ];
        })->shuffle()->values();

        return response()->json([
            'quizId' => $quiz->id,
            'questions' => $questions,
        ]);
    }

    public function test(Request $request, $quizId)
    {
        $quiz = \App\Models\Quiz::with('terms')->findOrFail($quizId);
        if ($quiz->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }
        return Inertia::render('quiz-test', [
            'quizId' => $quiz->id,
            'title' => $quiz->title,
            'description' => $quiz->description,
            'terms' => $quiz->terms->map(function ($term) {
                return [
                    'id' => $term->id,
                    'term' => $term->term,
                    'definition' => $term->definition,
                ];
            }),
        ]);
    }

    public function testSession(Request $request, $quizId)
    {
        $quiz = \App\Models\Quiz::with('terms')->findOrFail($quizId);
        if ($quiz->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }
        $terms = $quiz->terms;
        if ($terms->count() < 2) {
            return response()->json(['error' => 'Not enough terms for a test.'], 400);
        }
        $count = (int) $request->query('count', $terms->count());
        $count = max(1, min($count, $terms->count()));
        $questions = $terms->shuffle()->take($count)->map(function ($term) use ($terms) {
            $otherTerms = $terms->where('id', '!=', $term->id)->shuffle()->take(3);
            $choices = collect([$term->definition])
                ->merge($otherTerms->pluck('definition'))
                ->shuffle()
                ->values();
            return [
                'termId' => $term->id,
                'term' => $term->term,
                'choices' => $choices,
                'answer' => $term->definition,
            ];
        })->values();
        return response()->json([
            'quizId' => $quiz->id,
            'questions' => $questions,
        ]);
    }
}
