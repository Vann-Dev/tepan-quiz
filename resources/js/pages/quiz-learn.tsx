import { AlertDialog } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";
import { AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@/components/ui/alert-dialog";
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertDialogAction } from "@radix-ui/react-alert-dialog";


interface QuizLearnProps {
    quizId: string;
    title: string;
    description: string;
    terms?: { id: number; term: string; definition: string }[];
}

interface LearnQuestion {
    quizId: number;
    questions: {
        termId: number;
        term: string;
        choices: string[];
        answer: string;
    }[];
}


export default function Quiz(params: QuizLearnProps) {
    const [loading, setLoading] = React.useState(true);
    const [questions, setQuestions] = React.useState<LearnQuestion["questions"]>([]);
    const [currentIdx, setCurrentIdx] = React.useState(0);
    const [selected, setSelected] = React.useState<number | null>(null);
    const [result, setResult] = React.useState<null | boolean>(null);
    const [sessionEnd, setSessionEnd] = React.useState(false);

    // Track which questions have been answered correctly
    const [incorrectQueue, setIncorrectQueue] = React.useState<LearnQuestion["questions"]>([]);

    const fetchQuestions = React.useCallback(() => {
        setLoading(true);
        setSelected(null);
        setResult(null);
        setCurrentIdx(0);
        setIncorrectQueue([]);
        fetch(`/quizzes/${params.quizId}/learn-session`)
            .then(res => res.json())
            .then(data => {
                setQuestions(data.questions);
                setLoading(false);
            }).catch(err => {
                if (err instanceof Response && err.status === 400) {
                    alert("Not enough terms for a learn session.");
                } else {
                    console.error(err);
                }
            });
    }, [params.quizId]);

    React.useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    const handleSelect = (idx: number) => {
        if (selected !== null || loading || !questions.length) return;
        setSelected(idx);
        const current = questions[currentIdx];
        const isCorrect = current.choices[idx] === current.answer;
        setResult(isCorrect);
        setTimeout(() => {
            setSelected(null);
            setResult(null);
            if (currentIdx < questions.length - 1) {
                // Move to next question
                setCurrentIdx(currentIdx + 1);
                if (!isCorrect) {
                    setIncorrectQueue(prev => [...prev, current]);
                }
            } else {
                // End of current round
                let nextQueue = incorrectQueue;
                if (!isCorrect) {
                    nextQueue = [...incorrectQueue, current];
                }
                if (nextQueue.length > 0) {
                    setQuestions(nextQueue);
                    setCurrentIdx(0);
                    setIncorrectQueue([]);
                } else {
                    // All correct, fetch new set
                    setSessionEnd(true);
                }
            }
        }, 1500);
    };

    return (
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
                title: 'Learn',
                href: `/quizzes/${params.quizId}/learn`,
            }
        ]}>
            <Head title={params.title} />
            <AlertDialog open={sessionEnd} onOpenChange={setSessionEnd}>
                <AlertDialogContent>
                    <AlertDialogTitle>Session Ended</AlertDialogTitle>
                    <AlertDialogDescription>
                        Your session has ended. Would you like to review your answers?
                    </AlertDialogDescription>
                    <div className="flex gap-x-2 items-center">
                        <AlertDialogAction asChild onClick={fetchQuestions}>
                            <Button>
                                Start New Session
                            </Button>
                        </AlertDialogAction>
                        <Link href={`/quizzes/${params.quizId}`}>
                            <Button variant={"outline"}>
                                Back to Quiz
                            </Button>
                        </Link>
                    </div>
                </AlertDialogContent>
            </AlertDialog>

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

                    {loading || !questions.length ? (
                        <div className="text-center text-muted-foreground">Loading...</div>
                    ) : (
                        <>
                            <p className="text-center text-muted-foreground mt-2 text-sm mb-4">
                                What is the definition of:
                            </p>
                            <Card>
                                <CardHeader className="text-center text-xl font-bold">
                                    {questions[currentIdx].term}
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {questions[currentIdx].choices.map((choice, idx) => {
                                        let highlight = "";
                                        if (selected !== null) {
                                            if (idx === selected) {
                                                highlight = result
                                                    ? "border-green-500 bg-green-50 dark:bg-green-900/30"
                                                    : "border-red-500 bg-red-50 dark:bg-red-900/30";
                                            } else if (!result && choice === questions[currentIdx].answer) {
                                                highlight = "border-green-500 bg-green-50 dark:bg-green-900/30";
                                            }
                                        }
                                        return (
                                            <Card
                                                key={idx}
                                                className={
                                                    "transition-colors cursor-pointer " +
                                                    (highlight || "hover:border-primary/60 hover:bg-primary/10 dark:hover:bg-primary/20")
                                                }
                                                onClick={() => handleSelect(idx)}
                                            >
                                                <CardContent className="py-6 text-center">
                                                    {choice}
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                            <div className="text-center mt-4 text-sm text-muted-foreground">
                                Question {currentIdx + 1} of {questions.length}
                            </div>
                            {selected !== null && (
                                <div className="text-center mt-4">
                                    {result ? (
                                        <span className="text-green-600 font-semibold">Correct!</span>
                                    ) : (
                                        <span className="text-red-600 font-semibold">Incorrect. The correct answer is highlighted.</span>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}