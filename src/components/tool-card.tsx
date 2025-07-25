
"use client";

import * as React from 'react';
import Image from 'next/image';
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
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import type { Tool } from "@/lib/types";
import { ArrowUpRight, Calendar, Coins, PersonStanding, Sparkles, Star, ArrowBigUp, ArrowBigDown, User, RefreshCw, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { updateVote, refreshTool } from '@/app/actions';
import { Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';


type ToolCardProps = {
  tool: Tool;
  onVoteChange: (toolId: string, newUpvotes: number, newDownvotes: number) => void;
  onToolUpdate: (tool: Tool) => void;
};

function getImageHint(categories: string[]): string {
    if (categories.includes('developer-tools')) return 'code abstract';
    if (categories.includes('image-generation')) return 'abstract art';
    if (categories.includes('music-generation')) return 'sound waves';
    if (categories.includes('video-generation')) return 'video reel';
    if (categories.includes('productivity')) return 'workspace desk';
    if (categories.includes('copywriting')) return 'writing text';
    if (categories.includes('llm')) return 'neural network';
    return 'abstract background';
}

function getFormattedDate(date: Date | Timestamp | undefined): string {
    if (!date) return '';
    const dateObj = date instanceof Timestamp ? date.toDate() : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function ToolCard({ tool, onVoteChange, onToolUpdate }: ToolCardProps) {
  const [vote, setVote] = React.useState<'up' | 'down' | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const { toast } = useToast();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const result = await refreshTool({
        toolId: tool.id,
        url: tool.url,
        justification: tool.justification || 'Manual refresh request'
    });
    setIsRefreshing(false);
    if (result.success && result.data) {
        onToolUpdate(result.data);
        toast({
            title: "Update Successful!",
            description: result.message,
        });
    } else {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: result.error,
        });
    }
  };

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    let upvoteIncrement = 0;
    let downvoteIncrement = 0;

    if (vote === 'up') {
        setVote(null);
        upvoteIncrement = -1;
    } else if (vote === 'down') {
        setVote('up');
        upvoteIncrement = 1;
        downvoteIncrement = -1;
    } else {
        setVote('up');
        upvoteIncrement = 1;
    }
    
    // Optimistic UI update
    onVoteChange(tool.id, tool.upvotes + upvoteIncrement, tool.downvotes + downvoteIncrement);
    
    // Call server action
    await updateVote({ toolId: tool.id, upvoteIncrement, downvoteIncrement });
  };

  const handleDownvote = async (e: React.MouseEvent) => {
    e.stopPropagation();

    let upvoteIncrement = 0;
    let downvoteIncrement = 0;

    if (vote === 'down') {
        setVote(null);
        downvoteIncrement = -1;
    } else if (vote === 'up') {
        setVote('down');
        downvoteIncrement = 1;
        upvoteIncrement = -1;
    } else {
        setVote('down');
        downvoteIncrement = 1;
    }
    
    // Optimistic UI update
    onVoteChange(tool.id, tool.upvotes + upvoteIncrement, tool.downvotes + downvoteIncrement);

    // Call server action
    await updateVote({ toolId: tool.id, upvoteIncrement, downvoteIncrement });
  };
    
  return (
    <Dialog>
        <DialogTrigger asChild>
            <Card className="flex flex-col h-full cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary overflow-hidden">
                <CardHeader>
                    <div className="aspect-video relative mb-4">
                        <Image 
                            src={tool.imageUrl || 'https://placehold.co/600x400.png'} 
                            alt={tool.name} 
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            className="object-cover"
                            data-ai-hint={getImageHint(tool.categories)}
                        />
                    </div>
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
                <CardFooter className="flex justify-between items-center text-xs text-muted-foreground mt-auto pt-4">
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleUpvote}>
                            <ArrowBigUp className={cn("h-4 w-4", vote === 'up' && 'fill-primary text-primary')} />
                        </Button>
                        <span className="font-bold text-sm text-foreground">{tool.upvotes - tool.downvotes}</span>
                         <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleDownvote}>
                            <ArrowBigDown className={cn("h-4 w-4", vote === 'down' && 'fill-primary text-primary')} />
                        </Button>
                    </div>
                    <span>{getFormattedDate(tool.submittedAt)}</span>
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
                    <div className="flex items-center gap-2 text-muted-foreground"><ArrowBigUp className="h-4 w-4 text-primary" /> Upvotes: <span className="font-semibold text-foreground">{tool.upvotes}</span></div>
                    <div className="flex items-center gap-2 text-muted-foreground"><ArrowBigDown className="h-4 w-4 text-primary" /> Downvotes: <span className="font-semibold text-foreground">{tool.downvotes}</span></div>
                    <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4 text-primary" /> Submitted: <span className="font-semibold text-foreground">{getFormattedDate(tool.submittedAt)}</span></div>
                </div>
                {tool.submittedBy && tool.justification && (
                    <div className="pt-4 border-t">
                        <h4 className="font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Community Recommendation</h4>
                        <blockquote className="mt-2 border-l-2 pl-4 italic text-muted-foreground">
                            "{tool.justification}"
                        </blockquote>
                        <div className="text-right text-sm font-medium text-foreground flex items-center justify-end gap-2 mt-2">
                            <User className="h-4 w-4" />
                            <span>- {tool.submittedBy}</span>
                        </div>
                    </div>
                )}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
                    {isRefreshing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Refresh Data
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}
