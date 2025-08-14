import React from "react";
import { Button } from "./ui/button";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel
} from "./ui/alert-dialog";
import { TrashIcon } from "lucide-react";
import { router } from "@inertiajs/react";

export default function DeleteTermButton({ termId }: { termId: number }) {
    const [loading, setLoading] = React.useState(false);
    const handleDelete = () => {
        setLoading(true);
        router.delete(`/terms/${termId}`, {
            onFinish: () => setLoading(false),
        });
    };
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button size="icon" variant="destructive" disabled={loading}>
                    <TrashIcon />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Term</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete this term? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                    <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
                        {loading ? "Deleting..." : "Delete"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
