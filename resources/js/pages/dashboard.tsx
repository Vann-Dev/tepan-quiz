import CreateQuiz from '@/components/create-quiz';
import { Button } from '@/components/ui/button';
import DeleteQuiz from '@/components/delete-quiz';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

type Quiz = {
    id: number;
    title: string;
    description?: string;
    created_at: string;
    updated_at: string;
};

type DashboardProps = {
    quizzes: Quiz[];
};

export default function Dashboard({ quizzes }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div>
                    <div className='flex justify-between'>
                        <h1 className='text-2xl font-bold'>
                            Quizzes
                        </h1>
                        <CreateQuiz>
                            <Button>
                                Create New Quiz
                            </Button>
                        </CreateQuiz>
                    </div>

                    <div className='mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {quizzes.length === 0 ? (
                            <div className="col-span-full text-center text-muted-foreground">No quizzes found.</div>
                        ) : (
                            quizzes.map((quiz: Quiz) => (
                                <Card key={quiz.id}>
                                    <CardHeader>
                                        <CardTitle>{quiz.title}</CardTitle>
                                        <CardDescription>{quiz.description || <span className="italic text-muted-foreground">No description</span>}</CardDescription>
                                    </CardHeader>
                                    <CardFooter className="flex gap-2">
                                        <Link href={`/quizzes/${quiz.id}`}>
                                            <Button>View</Button>
                                        </Link>
                                        <DeleteQuiz quizId={quiz.id} />
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
