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
        // Pick a random term for the question
        $questionTerm = $terms->random();
        // Get other terms for wrong answers
        $otherTerms = $terms->where('id', '!=', $questionTerm->id)->shuffle()->take(3);
        $choices = collect([$questionTerm->definition])
            ->merge($otherTerms->pluck('definition'))
            ->shuffle()
            ->values();
        return response()->json([
            'quizId' => $quiz->id,
            'termId' => $questionTerm->id,
            'term' => $questionTerm->term,
            'choices' => $choices,
            'answer' => $questionTerm->definition,
        ]);
    }

    public function startLearnSession(Request $request, $quizId)
    {
        $quiz = Quiz::with('terms')->findOrFail($quizId);
        if ($quiz->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }
        $terms = $quiz->terms;
        if ($terms->count() < 2) {
            return response()->json(['error' => 'Not enough terms for a learn session.'], 400);
        }
        $order = $terms->pluck('id')->shuffle()->values()->toArray();
        $session = [
            'order' => $order,
            'current' => 0,
            'wrong' => [],
        ];
        session(["learn_session_{$quizId}" => $session]);
        return response()->json(['success' => true]);
    }

    public function answerLearnSession(Request $request, $quizId)
    {
        $quiz = Quiz::with('terms')->findOrFail($quizId);
        if ($quiz->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }
        $sessionKey = "learn_session_{$quizId}";
        $session = session($sessionKey);
        if (!$session) {
            return response()->json(['error' => 'Session not started.'], 400);
        }
        $order = $session['order'];
        $current = $session['current'];
        $wrong = $session['wrong'];
        $termId = $order[$current] ?? null;
        $term = $quiz->terms->firstWhere('id', $termId);
        if (!$term) {
            return response()->json(['error' => 'No more questions.'], 400);
        }
        $userAnswer = $request->input('answer');
        $isCorrect = $userAnswer === $term->definition;
        if ($isCorrect) {
            // Remove from wrong if present
            $wrong = array_filter($wrong, fn($id) => $id !== $termId);
            $current++;
        } else {
            if (!in_array($termId, $wrong)) {
                $wrong[] = $termId;
            }
        }
        // If finished, but there are wrongs, repeat them
        if ($current >= count($order) && count($wrong) > 0) {
            $order = array_values($wrong);
            $current = 0;
            $wrong = [];
        }
        $session = [
            'order' => $order,
            'current' => $current,
            'wrong' => $wrong,
        ];
        session([$sessionKey => $session]);

        // Prepare next question
        $nextTermId = $order[$current] ?? null;
        $nextTerm = $quiz->terms->firstWhere('id', $nextTermId);
        if (!$nextTerm) {
            return response()->json(['finished' => true]);
        }
        // Get other terms for wrong answers
        $otherTerms = $quiz->terms->where('id', '!=', $nextTerm->id)->shuffle()->take(3);
        $choices = collect([$nextTerm->definition])
            ->merge($otherTerms->pluck('definition'))
            ->shuffle()
            ->values();
        return response()->json([
            'quizId' => $quiz->id,
            'termId' => $nextTerm->id,
            'term' => $nextTerm->term,
            'choices' => $choices,
            'answer' => $nextTerm->definition,
            'progress' => [
                'current' => $current + 1,
                'total' => count($order),
            ],
        ]);
    }
}
