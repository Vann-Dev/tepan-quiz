import React from "react";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "@inertiajs/react";
import { Input } from "./ui/input";

export default function ImportTermsDialog({ quizId }: { quizId: number }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        bulk: "",
        fieldSeparator: "|",
        lineSeparator: "\n"
    });
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/quizzes/${quizId}/import-terms`, {
            onSuccess: () => reset(),
        });
    };
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline">Import</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Import Terms</AlertDialogTitle>
                    <AlertDialogDescription>
                        Paste your terms below, one per line, in the format: <br />
                        <code>term|definition</code>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-2">
                        <div>
                            <label className="block text-sm font-medium mb-1">Field Separator</label>
                            <Input
                                type="text"
                                name="fieldSeparator"
                                value={data.fieldSeparator}
                                onChange={e => setData("fieldSeparator", e.target.value)}
                                maxLength={3}
                                required
                                className="mt-4"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Line Separator</label>
                            <Input
                                type="text"
                                name="lineSeparator"
                                value={data.lineSeparator}
                                onChange={e => setData("lineSeparator", e.target.value)}
                                maxLength={4}
                                required
                                className="mt-4"
                            />
                        </div>
                    </div>
                    <Textarea
                        name="bulk"
                        value={data.bulk}
                        onChange={e => setData("bulk", e.target.value)}
                        placeholder={
                            data.lineSeparator === "\n\n"
                                ? `cat${data.fieldSeparator}a small domesticated carnivorous mammal\n\ndog${data.fieldSeparator}a domesticated canid`
                                : `cat${data.fieldSeparator}a small domesticated carnivorous mammal\n` +
                                `dog${data.fieldSeparator}a domesticated canid`
                        }
                        rows={8}
                        required
                    />
                    {errors.bulk && <div className="text-red-500 text-sm mt-1">{errors.bulk}</div>}
                    <AlertDialogFooter>
                        <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                        <Button type="submit" disabled={processing}>Import</Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}
