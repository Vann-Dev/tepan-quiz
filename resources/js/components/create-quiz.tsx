import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useForm } from "@inertiajs/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type QuizForm = {
    title: string;
    description?: string;
}

export default function CreateQuiz({
    children
}: {
    children: React.ReactNode
}) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<QuizForm>({
        title: '',
        description: '',
    });

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Create Quiz</AlertDialogTitle>
                    <AlertDialogDescription>
                        Fill out the form below to create a new quiz.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        post("/quizzes", {
                            onSuccess: () => {
                                setOpen(false);
                                reset();
                            },
                        });
                    }}
                    className="space-y-4"
                >
                    <div>
                        <label htmlFor="title" className="block mb-1 font-medium">Title</label>
                        <Input
                            id="title"
                            name="title"
                            value={data.title}
                            onChange={e => setData("title", e.target.value)}
                            required
                            placeholder="Quiz title"
                        />
                        {errors.title && (
                            <div className="text-red-500 text-sm mt-1">{errors.title}</div>
                        )}
                    </div>
                    <div>
                        <label htmlFor="description" className="block mb-1 font-medium">Description</label>
                        <Input
                            id="description"
                            name="description"
                            value={data.description}
                            onChange={e => setData("description", e.target.value)}
                            placeholder="Quiz description (optional)"
                        />
                        {errors.description && (
                            <div className="text-red-500 text-sm mt-1">{errors.description}</div>
                        )}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                        <Button type="submit" disabled={processing}>Create</Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}