
"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Price, EaseOfUse } from "@/lib/types";
import { Sparkles } from "lucide-react";

export type FilterState = {
  search: string;
  category: string;
  price: "all" | Price;
  easeOfUse: "all" | EaseOfUse;
  submittedBy: string;
};

export type SortState = "most-up-votes" | "least-up-votes" | "newest";

type FiltersProps = {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  sortBy: SortState;
  setSortBy: React.Dispatch<React.SetStateAction<SortState>>;
  categories: string[];
  submitters: string[];
};

export function Filters({
  filters,
  setFilters,
  sortBy,
  setSortBy,
  categories,
  submitters,
}: FiltersProps) {
  const handleFilterChange = (
    key: keyof FilterState,
    value: string | boolean
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const priceOptions: { value: "all" | Price; label: string }[] = [
    { value: "all", label: "All Prices" },
    { value: "Free", label: "Free" },
    { value: "Freemium", label: "Freemium" },
    { value: "Paid", label: "Paid" },
  ];

  const easeOfUseOptions: { value: "all" | EaseOfUse; label: string }[] = [
    { value: "all", label: "All Levels" },
    { value: "Beginner", label: "Beginner" },
    { value: "Intermediate", label: "Intermediate" },
    { value: "Expert", label: "Expert" },
  ];

  return (
    <div className="mb-8 p-4 border rounded-lg bg-card shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-end">
        <div className="lg:col-span-1">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search by name or description..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={filters.category}
            onValueChange={(value) => handleFilterChange("category", value)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === "all"
                    ? "All Categories"
                    : cat.charAt(0).toUpperCase() + cat.slice(1).replace("-", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="price">Price</Label>
          <Select
            value={filters.price}
            onValueChange={(value) => handleFilterChange("price", value)}
          >
            <SelectTrigger id="price">
              <SelectValue placeholder="Select price" />
            </SelectTrigger>
            <SelectContent>
              {priceOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
            <Label htmlFor="easeOfUse">Ease of Use</Label>
            <Select
                value={filters.easeOfUse}
                onValueChange={(value) => handleFilterChange("easeOfUse", value)}
            >
                <SelectTrigger id="easeOfUse">
                <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                {easeOfUseOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
            <Label htmlFor="submittedBy" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Community Curated
            </Label>
            <Select
                value={filters.submittedBy}
                onValueChange={(value) => handleFilterChange("submittedBy", value)}
            >
                <SelectTrigger id="submittedBy">
                    <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                {submitters.map((submitter) => (
                    <SelectItem key={submitter} value={submitter}>
                    {submitter === "all" ? "All Members" : submitter}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
        </div>
        <div className="flex-1 min-w-[200px]">
            <Label htmlFor="sort-by">Sort By</Label>
            <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SortState)}
            >
                <SelectTrigger id="sort-by">
                <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="most-up-votes">Most Popular</SelectItem>
                  <SelectItem value="least-up-votes">Least Popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>
    </div>
  );
}
