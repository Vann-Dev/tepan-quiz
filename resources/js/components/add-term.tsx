import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel
} from "@/components/ui/alert-dialog";
import { useForm } from "@inertiajs/react";
import { Textarea } from "./ui/textarea";

export default function AddTerm({ quizId }: { quizId: number }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        term: "",
        definition: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/quizzes/${quizId}/terms`, {
            onSuccess: () => reset(),
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline">Add Term</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Add New Term</AlertDialogTitle>
                    <AlertDialogDescription>
                        Enter the term and its definition below.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Input
                            name="term"
                            value={data.term}
                            onChange={e => setData("term", e.target.value)}
                            placeholder="Term"
                            required
                        />
                        {errors.term && <div className="text-red-500 text-sm mt-1">{errors.term}</div>}
                    </div>
                    <div>
                        <Textarea
                            name="definition"
                            value={data.definition}
                            onChange={e => setData("definition", e.target.value)}
                            placeholder="Definition"
                            required
                        />
                        {errors.definition && <div className="text-red-500 text-sm mt-1">{errors.definition}</div>}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                        <Button type="submit" disabled={processing}>Add</Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}
