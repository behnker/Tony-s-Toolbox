"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import type { Tool } from "@/lib/types";
import { ArrowUpRight, Calendar, Coins, PersonStanding, Sparkles, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type ToolCardProps = {
  tool: Tool;
};

export function ToolCard({ tool }: ToolCardProps) {
    
  return (
    <Dialog>
        <DialogTrigger asChild>
            <Card className="flex flex-col h-full cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary">
                <CardHeader>
                    <CardTitle className="flex justify-between items-start font-headline">
                        <span className="truncate">{tool.name}</span>
                        <ArrowUpRight className="h-5 w-5 text-muted-foreground shrink-0" />
                    </CardTitle>
                    <CardDescription className="line-clamp-2">{tool.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <div className="flex flex-wrap gap-2">
                        {tool.categories.slice(0, 3).map((category) => (
                        <Badge key={category} variant="secondary">
                            {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                        </Badge>
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-400" />
                        <span>{tool.popularity}</span>
                    </div>
                    <span>{formatDistanceToNow(tool.submittedAt, { addSuffix: true })}</span>
                </CardFooter>
            </Card>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
            <DialogTitle className="font-headline text-2xl">{tool.name}</DialogTitle>
            <DialogDescription>
                <a href={tool.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                    {tool.url} <ArrowUpRight className="h-4 w-4" />
                </a>
            </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <p>{tool.description}</p>
                <div className="flex flex-wrap gap-2">
                    {tool.categories.map((category) => (
                    <Badge key={category} variant="secondary">
                        {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                    </Badge>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm pt-4">
                    <div className="flex items-center gap-2 text-muted-foreground"><Coins className="h-4 w-4 text-primary" /> Price: <span className="font-semibold text-foreground">{tool.price}</span></div>
                    <div className="flex items-center gap-2 text-muted-foreground"><PersonStanding className="h-4 w-4 text-primary" /> Ease of Use: <span className="font-semibold text-foreground">{tool.easeOfUse}</span></div>
                    <div className="flex items-center gap-2 text-muted-foreground"><Star className="h-4 w-4 text-primary" /> Popularity: <span className="font-semibold text-foreground">{tool.popularity}</span></div>
                    <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4 text-primary" /> Submitted: <span className="font-semibold text-foreground">{formatDistanceToNow(tool.submittedAt, { addSuffix: true })}</span></div>
                </div>
                {tool.submittedBy && tool.justification && (
                    <div className="pt-4 border-t">
                        <h4 className="font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Community Recommendation</h4>
                        <blockquote className="mt-2 border-l-2 pl-4 italic text-muted-foreground">
                            "{tool.justification}"
                        </blockquote>
                        <p className="text-right text-sm font-medium text-foreground">- {tool.submittedBy}</p>
                    </div>
                )}
            </div>
        </DialogContent>
    </Dialog>
  );
}
