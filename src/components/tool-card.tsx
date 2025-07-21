"use client";

import * as React from 'react';
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
import { ArrowUpRight, Calendar, Coins, PersonStanding, Sparkles, Star, ArrowBigUp, ArrowBigDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

type ToolCardProps = {
  tool: Tool;
  onVoteChange: (toolId: string, newVotes: number) => void;
};

export function ToolCard({ tool, onVoteChange }: ToolCardProps) {
  const [vote, setVote] = React.useState<'up' | 'down' | null>(null);

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (vote === 'up') {
        setVote(null);
        onVoteChange(tool.id, tool.votes - 1);
    } else if (vote === 'down') {
        setVote('up');
        onVoteChange(tool.id, tool.votes + 2);
    } else {
        setVote('up');
        onVoteChange(tool.id, tool.votes + 1);
    }
  };

  const handleDownvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (vote === 'down') {
        setVote(null);
        onVoteChange(tool.id, tool.votes + 1);
    } else if (vote === 'up') {
        setVote('down');
        onVoteChange(tool.id, tool.votes - 2);
    } else {
        setVote('down');
        onVoteChange(tool.id, tool.votes - 1);
    }
  };
    
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
                <CardFooter className="flex justify-between items-center text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleUpvote}>
                            <ArrowBigUp className={cn("h-4 w-4", vote === 'up' && 'fill-primary text-primary')} />
                        </Button>
                        <span className="font-bold text-sm text-foreground">{tool.votes}</span>
                         <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleDownvote}>
                            <ArrowBigDown className={cn("h-4 w-4", vote === 'down' && 'fill-primary text-primary')} />
                        </Button>
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
                    <div className="flex items-center gap-2 text-muted-foreground"><Star className="h-4 w-4 text-primary" /> Votes: <span className="font-semibold text-foreground">{tool.votes}</span></div>
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
