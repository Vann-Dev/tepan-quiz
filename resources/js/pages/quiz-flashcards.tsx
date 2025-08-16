import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout"
import { Head } from "@inertiajs/react";

import React from "react";
import { MoveLeftIcon, MoveRightIcon } from "lucide-react";

function Flashcard({ term, definition }: { term: string; definition: string }) {
    const [flipped, setFlipped] = React.useState(false);
    return (
        <div
            className="h-96 cursor-pointer perspective"
            onClick={() => setFlipped(f => !f)}
        >
            <div
                className={
                    "relative w-full h-full transition-transform duration-500" +
                    (flipped ? " rotate-y-180" : "")
                }
                style={{ transformStyle: "preserve-3d" }}
            >
                <div
                    className="absolute w-full h-full flex items-center justify-center backface-hidden bg-white px-4 py-2 dark:bg-zinc-900 rounded-xl shadow"
                    style={{ backfaceVisibility: "hidden" }}
                >
                    <p className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">{term}</p>
                </div>
                <div
                    className="absolute w-full h-full flex items-center justify-center backface-hidden px-4 py-2 bg-white dark:bg-zinc-900 rounded-xl shadow rotate-y-180"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                    <p className="text-2xl text-center whitespace-pre-line text-zinc-900 dark:text-zinc-100">{definition}</p>
                </div>
            </div>
        </div>
    );
}

// CSS for perspective and 3D flip
if (typeof window !== "undefined") {
    const style = document.createElement('style');
    style.innerHTML = `
.perspective { perspective: 1200px; }
.rotate-y-180 { transform: rotateY(180deg) !important; }
.backface-hidden { backface-visibility: hidden; }
`;
    if (!document.head.querySelector('style[data-flashcard]')) {
        style.setAttribute('data-flashcard', '');
        document.head.appendChild(style);
    }
}

export default function QuizFlashcards(params: {
    quizId: string,
    title: string,
    description: string,
    terms?: { id: number; term: string; definition: string }[]
}) {
    const [current, setCurrent] = React.useState(0);
    const terms = params.terms || [];
    const hasTerms = terms.length > 0;
    const goLeft = () => setCurrent(c => (c - 1 + terms.length) % terms.length);
    const goRight = () => setCurrent(c => (c + 1) % terms.length);

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

                    <div className="mx-16">
                        <Flashcard
                            term={hasTerms ? terms[current].term : "No terms"}
                            definition={hasTerms ? terms[current].definition : ""}
                        />
                    </div>

                    <div className="flex mt-4 justify-center gap-x-4">
                        <Button
                            variant="outline"
                            size={"icon"}
                            onClick={goLeft}
                            disabled={!hasTerms || terms.length < 2}
                            aria-label="Previous"
                        >
                            <MoveLeftIcon />
                        </Button>
                        <Button
                            variant="outline"
                            size={"icon"}
                            onClick={goRight}
                            disabled={!hasTerms || terms.length < 2}
                            aria-label="Next"
                        >
                            <MoveRightIcon />
                        </Button>
                    </div>
                    {hasTerms && terms.length > 1 && (
                        <div className="text-center text-muted-foreground mt-2 text-sm">
                            Card {current + 1} of {terms.length}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}