import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import AppLayout from "@/layouts/app-layout"
import { Head, router } from "@inertiajs/react";
import React from "react";
import AddTerm from "@/components/add-term";
import TermCard from "@/components/term-card";
import ImportTermsDialog from "@/components/import-terms-dialog";

interface Term {
    id: number;
    term: string;
    definition: string;
}

interface QuizEditProps {
    quizId: string;
    title: string;
    description: string;
    terms: Term[];
}

export default function QuizEdit(params: QuizEditProps) {
    const [title, setTitle] = React.useState(params.title);
    const [description, setDescription] = React.useState(params.description);
    const [saving, setSaving] = React.useState(false);

    const handleSave = () => {
        setSaving(true);
        router.put(`/quizzes/${params.quizId}`, {
            title,
            description,
        }, {
            onFinish: () => setSaving(false),
        });
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
                title: 'Edit',
                href: `/quizzes/${params.quizId}/edit`,
            }
        ]}>
            <Head title={title} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div>
                    <div className="flex justify-between mb-4">
                        <div>
                            <h1 className='text-2xl font-bold'>
                                {params.title}
                            </h1>
                            <p>{params.description}</p>
                        </div>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                    <div className="flex justify-between my-4 gap-4 flex-col sm:flex-row">
                        <div className="flex-1">
                            <Input
                                className="text-2xl font-bold mb-2"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Quiz Title"
                                name="title"
                                required
                            />
                            <Input
                                className="mb-2"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Quiz Description"
                                name="description"
                            />
                        </div>
                    </div>

                    <ImportTermsDialog quizId={parseInt(params.quizId)} />

                    <Separator className="my-4" />

                    <div className="grid gap-4">
                        {params.terms && params.terms.length > 0 ? (
                            params.terms.map(term => (
                                <TermCard deleteButton key={term.id} id={term.id} term={term.term} definition={term.definition} />
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground">No terms yet.</div>
                        )}
                        <div className="flex justify-center items-center">
                            <AddTerm quizId={parseInt(params.quizId)} />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}