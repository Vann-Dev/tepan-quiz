
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";
import React from "react";


interface QuizLearnProps {
    quizId: string;
    title: string;
    description: string;
    terms?: { id: number; term: string; definition: string }[];
}

interface LearnQuestion {
    quizId: number;
    termId: number;
    term: string;
    choices: string[];
    answer: string;
}

export default function Quiz(params: QuizLearnProps) {
    const [loading, setLoading] = React.useState(true);
    const [question, setQuestion] = React.useState<LearnQuestion | null>(null);
    const [selected, setSelected] = React.useState<number | null>(null);
    const [result, setResult] = React.useState<null | boolean>(null);

    const fetchQuestion = React.useCallback(() => {
        setLoading(true);
        setSelected(null);
        setResult(null);
        fetch(`/quizzes/${params.quizId}/learn-session`)
            .then(res => res.json())
            .then(data => {
                setQuestion(data);
                setLoading(false);
            });
    }, [params.quizId]);

    React.useEffect(() => {
        fetchQuestion();
    }, [fetchQuestion]);

    const handleSelect = (idx: number) => {
        if (selected !== null || !question) return;
        setSelected(idx);
        const isCorrect = question.choices[idx] === question.answer;
        setResult(isCorrect);
        if (!isCorrect) {
            setTimeout(() => {
                fetchQuestion();
            }, 1000);
        }
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

                    {loading || !question ? (
                        <div className="text-center text-muted-foreground">Loading...</div>
                    ) : (
                        <>
                            <p className="text-center text-muted-foreground mt-2 text-sm mb-4">
                                What is the definition of:
                            </p>
                            <Card>
                                <CardHeader className="text-center text-xl font-bold">
                                    {question.term}
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {question.choices.map((choice, idx) => {
                                        let highlight = "";
                                        if (selected !== null) {
                                            if (idx === selected) {
                                                highlight = result
                                                    ? "border-green-500 bg-green-50 dark:bg-green-900/30"
                                                    : "border-red-500 bg-red-50 dark:bg-red-900/30";
                                            } else if (!result && choice === question.answer) {
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
                            {selected !== null && (
                                <div className="text-center mt-4">
                                    {result ? (
                                        <span className="text-green-600 font-semibold">Correct!</span>
                                    ) : (
                                        <span className="text-red-600 font-semibold">Incorrect. The correct answer is highlighted.</span>
                                    )}
                                    {result && (
                                        <div className="mt-2">
                                            <Button onClick={fetchQuestion} variant="outline">Next</Button>
                                        </div>
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