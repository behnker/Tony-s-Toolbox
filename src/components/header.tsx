"use client";

import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SubmitToolDialog } from "@/components/submit-tool-dialog";
import type { Tool } from "@/lib/types";
import { PlusCircle } from "lucide-react";

type AppHeaderProps = {
  onToolSubmitted: (tool: Tool) => void;
};

export function AppHeader({ onToolSubmitted }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <Logo className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block font-headline">
              Tony's Toolbox
            </span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
            <SubmitToolDialog onToolSubmitted={onToolSubmitted}>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Submit Tool
                </Button>
            </SubmitToolDialog>
        </div>
      </div>
    </header>
  );
}
