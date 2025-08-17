import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout"
import { Head } from "@inertiajs/react";
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// Define a type for the test question
interface TestQuestion {
    termId: number;
    term: string;
    choices: string[];
    answer: string;
}

export default function Quiz(params: {
    quizId: string,
    title: string,
    description: string,
    terms?: { id: number; term: string; definition: string }[]
}) {
    const [questions, setQuestions] = useState<TestQuestion[]>([]);
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<{ correct: number; total: number } | null>(null);
    const [count, setCount] = useState<number | null>(null);
    const [countInput, setCountInput] = useState<string>("");
    const [showDialog, setShowDialog] = useState(true);

    useEffect(() => {
        if (count === null) return;
        setLoading(true);
        fetch(`/quizzes/${params.quizId}/test-session?count=${count}`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch test questions");
                return res.json();
            })
            .then(data => {
                setQuestions(data.questions || []);
                setLoading(false);
            })
            .catch(e => {
                setError(e.message);
                setLoading(false);
            });
    }, [params.quizId, count]);

    const handleSelect = (termId: number, value: string) => {
        setAnswers(a => ({ ...a, [termId]: value }));
    };

    const handleSubmit = () => {
        let correct = 0;
        questions.forEach(q => {
            if (answers[q.termId] === q.answer) correct++;
        });
        setResult({ correct, total: questions.length });
    };

    const handleDialogConfirm = () => {
        const max = params.terms?.length || 1;
        let num = parseInt(countInput || `${max}`);
        if (isNaN(num) || num < 1) num = 1;
        if (num > max) num = max;
        setCount(num);
        setShowDialog(false);
    };

    // Show dialog only on first load or when retrying
    useEffect(() => {
        if (count === null && showDialog && params.terms && params.terms.length > 0) {
            setCountInput(`${params.terms.length}`);
        }
    }, [params.terms, count, showDialog]);

    return (
        <>
            <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>How many questions do you want to test?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Enter a number between 1 and {params.terms?.length || 1}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Input
                        type="number"
                        min={1}
                        max={params.terms?.length || 1}
                        value={countInput}
                        onChange={e => setCountInput(e.target.value)}
                        className="border rounded px-2 py-1 w-full mb-4"
                    />
                    <AlertDialogFooter>
                        <Button onClick={handleDialogConfirm}>Start Test</Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AppLayout breadcrumbs={[
                {
                    title: 'Dashboard',
                    href: '/dashboard',
                },
                {
                    title: params.title,
                    href: `/quizzes/${params.quizId}`,
                },
                {
                    title: "Test",
                    href: `/quizzes/${params.quizId}/test`,
                }
            ]}>
                <Head title={params.title} />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                    <div>
                        <div className="flex justify-between mb-4">
                            <div>
                                <h1 className='text-2xl font-bold'>
                                    {params.title}
                                </h1>
                                <p>{params.description}</p>
                            </div>
                        </div>

                        {loading ? (
                            <div>Loading questions...</div>
                        ) : error ? (
                            <div className="text-red-500">{error}</div>
                        ) : result ? (
                            <div className="text-center">
                                <div className="text-2xl font-bold mb-2">Result</div>
                                <div className="mb-4">You got {result.correct} out of {result.total} correct.</div>
                                <Button onClick={() => { setResult(null); setAnswers({}); setCount(null); setShowDialog(true); }}>Try Again</Button>
                            </div>
                        ) : (
                            <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
                                <div className="grid gap-y-4">
                                    {questions.map((q, idx) => (
                                        <Card key={q.termId}>
                                            <CardHeader>
                                                <CardTitle>
                                                    {idx + 1}. {q.term}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <RadioGroup
                                                    value={answers[q.termId] || ""}
                                                    onValueChange={val => handleSelect(q.termId, val)}
                                                >
                                                    {q.choices.map((choice: string, cidx: number) => (
                                                        <div className="flex items-center space-x-2" key={cidx}>
                                                            <RadioGroupItem value={choice} id={`q${q.termId}-opt${cidx}`} />
                                                            <Label htmlFor={`q${q.termId}-opt${cidx}`}>{choice}</Label>
                                                        </div>
                                                    ))}
                                                </RadioGroup>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                                <div className="mt-6 flex justify-center">
                                    <Button type="submit">Submit</Button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </AppLayout>
        </>
    );
}