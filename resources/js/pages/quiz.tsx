import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AppLayout from "@/layouts/app-layout"
import { Head, Link } from "@inertiajs/react";
import TermCard from "@/components/term-card";

export default function Quiz(params: {
    quizId: string,
    title: string,
    description: string,
    terms?: { id: number; term: string; definition: string }[]
}) {
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
                        <Link href={`/quizzes/${params.quizId}/edit`}>
                            <Button variant={"outline"}>
                                Edit
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href={`/quizzes/${params.quizId}/flashcards`}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-center">
                                        🗂️ Flashcard
                                    </CardTitle>
                                </CardHeader>
                            </Card>
                        </Link>
                        <Link href={`/quizzes/${params.quizId}/learn`}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-center">
                                        🤓 Learn
                                    </CardTitle>
                                </CardHeader>
                            </Card>
                        </Link>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-center">
                                    🤔 Test
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid gap-4">
                        {params.terms && params.terms.length > 0 ? (
                            params.terms.map(term => (
                                <TermCard key={term.id} id={term.id} term={term.term} definition={term.definition} />
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground">No terms yet.</div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}