import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";
import DeleteTermButton from "./delete-term-button";

export default function TermCard({
    term,
    definition,
    id,
    deleteButton
}: {
    term: string;
    definition: string;
    id: number;
    deleteButton?: boolean;
}) {
    return (
        <Card>
            <CardContent className="flex flex-col lg:flex-row">
                <div className="w-70 mb-4 lg:mb-0">
                    {term}
                </div>
                <Separator className="mx-4 hidden lg:block" orientation="vertical" />
                <div className="w-3/4">
                    {definition.split('\n').map((line, idx) => (
                        <span key={idx}>
                            {line}
                            {idx < definition.split('\n').length - 1 && <br />}
                        </span>
                    ))}
                </div>
                <div className={`mt-4 lg:mt-0 ml-auto ${deleteButton ? '' : 'hidden'}`}>
                    <DeleteTermButton termId={id} />
                </div>
            </CardContent>
        </Card>
    )
}