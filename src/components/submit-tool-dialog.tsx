
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitTool } from "@/app/actions";
import type { Tool } from "@/lib/types";
import { Loader2 } from "lucide-react";


const formSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
  submittedBy: z.string().min(2, { message: "Name must be at least 2 characters." }),
  justification: z.string().min(10, { message: "Justification must be at least 10 characters." }),
});

type SubmitToolDialogProps = {
  children: React.ReactNode;
  onToolSubmitted: (tool: Tool) => void;
};

type SubmissionStatus = "idle" | "submitting";


export function SubmitToolDialog({ children, onToolSubmitted }: SubmitToolDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [submissionStatus, setSubmissionStatus] = React.useState<SubmissionStatus>("idle");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      submittedBy: "",
      justification: "",
    },
  });


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmissionStatus("submitting");
    const result = await submitTool(values);

    if (result.success && result.data) {
      toast({
        title: "Submission Successful!",
        description: result.message,
      });
      onToolSubmitted(result.data);
      setOpen(false);
      form.reset();
    } else {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: result.error,
      });
    }
    setSubmissionStatus("idle");
  }

  const isSubmitting = submissionStatus !== 'idle';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Submit a New AI Tool</DialogTitle>
          <DialogDescription>
            Found a cool tool? Share it with the community! We&apos;ll use AI to automatically fetch its details.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tool URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="submittedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input placeholder="AI Explorer" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="justification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Why do you recommend this tool?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="It&apos;s great for..."
                      className="resize-none"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting ? 'Extracting Info...' : 'Submit Tool'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
