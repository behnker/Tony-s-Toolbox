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

export type FilterState = {
  search: string;
  category: string;
  price: "all" | Price;
  easeOfUse: "all" | EaseOfUse;
};

export type SortState = "popular" | "newest";

type FiltersProps = {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  sortBy: SortState;
  setSortBy: React.Dispatch<React.SetStateAction<SortState>>;
  categories: string[];
};

export function Filters({
  filters,
  setFilters,
  sortBy,
  setSortBy,
  categories,
}: FiltersProps) {
  const handleFilterChange = (key: keyof FilterState, value: string) => {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
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
                  {cat === "all" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
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
          <Label htmlFor="sort-by">Sort By</Label>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortState)}>
            <SelectTrigger id="sort-by">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
