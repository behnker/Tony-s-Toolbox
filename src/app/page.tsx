
"use client";

import * as React from "react";
import { useMemo, useState, useEffect } from "react";
import { AppHeader } from "@/components/header";
import { ToolCard } from "@/components/tool-card";
import { Filters, type FilterState, type SortState } from "@/components/filters-and-sorters";
import type { Tool } from "@/lib/types";
import { getTools } from "@/app/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [tools, setTools] = useState<Tool[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "all",
    price: "all",
    easeOfUse: "all",
    submittedBy: "all",
  });
  const [sortBy, setSortBy] = useState<SortState>("most-up-votes");

  useEffect(() => {
    async function fetchTools() {
      try {
        const fetchedTools = await getTools();
        setTools(fetchedTools);
      } catch (error) {
        console.error("Error fetching tools:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTools();
  }, []);

  const handleToolUpdate = (updatedTool: Tool) => {
    setTools((prevTools) => 
      prevTools.map(tool => tool.id === updatedTool.id ? updatedTool : tool)
    );
  };

  const handleToolSubmitted = (submittedTool: Tool) => {
    setTools((prevTools) => {
      const existingToolIndex = prevTools.findIndex(tool => tool.id === submittedTool.id);
      if (existingToolIndex !== -1) {
        // Update existing tool
        const newTools = [...prevTools];
        newTools[existingToolIndex] = submittedTool;
        return newTools;
      } else {
        // Add new tool
        return [submittedTool, ...prevTools];
      }
    });
  };
  
  const handleVoteChange = (toolId: string, newUpvotes: number, newDownvotes: number) => {
    setTools(prevTools =>
      prevTools.map(tool =>
        tool.id === toolId ? { ...tool, upvotes: newUpvotes, downvotes: newDownvotes } : tool
      )
    );
  };

  const filteredAndSortedTools = useMemo(() => {
    const filtered = tools.filter((tool) => {
      const searchLower = filters.search.toLowerCase();

      const nameMatch = tool.name.toLowerCase().includes(searchLower);
      const descriptionMatch = tool.description.toLowerCase().includes(searchLower);
      const categoryMatch =
        filters.category === "all" || tool.categories.includes(filters.category);
      const priceMatch = filters.price === "all" || tool.price === filters.price;
      const easeOfUseMatch =
        filters.easeOfUse === "all" || tool.easeOfUse === filters.easeOfUse;
      
      const submittedByMatch = filters.submittedBy === 'all' || tool.submittedBy === filters.submittedBy;

      return (nameMatch || descriptionMatch) && categoryMatch && priceMatch && easeOfUseMatch && submittedByMatch;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "most-up-votes") {
        return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
      }
      if (sortBy === "least-up-votes") {
        return (a.upvotes - a.downvotes) - (b.upvotes - b.downvotes);
      }
      if (sortBy === "newest") {
        const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return dateB - dateA;
      }
      return 0;
    });
  }, [tools, filters, sortBy]);

  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    tools.forEach((tool) => {
      tool.categories.forEach((cat) => categories.add(cat));
    });
    return ["all", ...Array.from(categories)];
  }, [tools]);
  
  const allSubmitters = useMemo(() => {
    const submitters = new Set<string>();
    tools.forEach((tool) => {
      if (tool.submittedBy) {
        submitters.add(tool.submittedBy);
      }
    });
    return ["all", ...Array.from(submitters)];
  }, [tools]);

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader onToolSubmitted={handleToolSubmitted} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-center mb-2 text-foreground">
                Tony&apos;s Toolbox: AI Tool Explorer
            </h1>
            <p className="text-lg md:text-xl text-center text-muted-foreground max-w-3xl mx-auto">
                Discover, share, and explore the best AI tools and workflows. Filter by use-case, price, and more to find the perfect tool for your needs.
            </p>
        </div>
        
        <Filters
          filters={filters}
          setFilters={setFilters}
          sortBy={sortBy}
          setSortBy={setSortBy}
          categories={allCategories}
          submitters={allSubmitters}
        />

        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="aspect-video relative mb-4" />
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Skeleton className="h-6 w-20" />
                                <Skeleton className="h-6 w-24" />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-4 w-24" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} onVoteChange={handleVoteChange} onToolUpdate={handleToolUpdate} />
                ))}
            </div>
        )}
      </main>
      <footer className="py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Tony&apos;s Toolbox. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
