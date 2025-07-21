"use client";

import * as React from "react";
import { useMemo, useState, useEffect } from "react";
import { AppHeader } from "@/components/header";
import { ToolCard } from "@/components/tool-card";
import { Filters, type FilterState, type SortState } from "@/components/filters-and-sorters";
import type { Tool } from "@/lib/types";
import { initialTools } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [tools, setTools] = useState<Tool[]>(initialTools);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "all",
    price: "all",
    easeOfUse: "all",
    recommended: false,
  });
  const [sortBy, setSortBy] = useState<SortState>("popular");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleToolSubmitted = (newTool: Tool) => {
    setTools((prevTools) => [newTool, ...prevTools]);
  };
  
  const handleVoteChange = (toolId: string, newVotes: number) => {
    setTools(prevTools =>
      prevTools.map(tool =>
        tool.id === toolId ? { ...tool, votes: newVotes } : tool
      )
    );
  };

  const filteredAndSortedTools = useMemo(() => {
    let filtered = tools.filter((tool) => {
      const searchLower = filters.search.toLowerCase();
      const nameMatch = tool.name.toLowerCase().includes(searchLower);
      const descriptionMatch = tool.description.toLowerCase().includes(searchLower);
      const categoryMatch =
        filters.category === "all" || tool.categories.includes(filters.category);
      const priceMatch = filters.price === "all" || tool.price === filters.price;
      const easeOfUseMatch =
        filters.easeOfUse === "all" || tool.easeOfUse === filters.easeOfUse;
      const recommendedMatch = !filters.recommended || (!!tool.submittedBy && !!tool.justification);

      return (nameMatch || descriptionMatch) && categoryMatch && priceMatch && easeOfUseMatch && recommendedMatch;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "popular") {
        return b.votes - a.votes;
      }
      if (sortBy === "newest") {
        return b.submittedAt.getTime() - a.submittedAt.getTime();
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
  
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader onToolSubmitted={handleToolSubmitted} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-center mb-2 text-foreground">
                Tony's Toolbox
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
        />

        {isMounted ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} onVoteChange={handleVoteChange} />
                ))}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3">
                        <Skeleton className="h-[125px] w-full rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                ))}
            </div>
        )}
      </main>
      <footer className="py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Tony's Toolbox. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
