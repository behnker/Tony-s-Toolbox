
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
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";


const formSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
  submittedBy: z.string().min(2, { message: "Name must be at least 2 characters." }),
  justification: z.string().min(10, { message: "Justification must be at least 10 characters." }),
  image: z.custom<FileList>().optional(),
});

type SubmitToolDialogProps = {
  children: React.ReactNode;
  onToolSubmitted: (tool: Tool) => void;
};

type SubmissionStatus = "idle" | "uploading" | "submitting";


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
    let imageUrl: string | undefined = undefined;
    setSubmissionStatus("idle");

    // Handle file upload
    if (values.image && values.image.length > 0) {
        setSubmissionStatus("uploading");
        const file = values.image[0];
        const storageRef = ref(storage, `tool-images/${crypto.randomUUID()}-${file.name}`);
        try {
            const snapshot = await uploadBytes(storageRef, file);
            imageUrl = await getDownloadURL(snapshot.ref);
        } catch (error) {
            console.error("Error uploading image:", error);
            toast({
                variant: "destructive",
                title: "Image Upload Failed",
                description: "Could not upload the image. Please try again.",
            });
            setSubmissionStatus("idle");
            return; 
        }
    }

    setSubmissionStatus("submitting");
    const result = await submitTool({ ...values, imageUrl });

    if (result.success && result.data) {
      toast({
        title: "Tool Submitted!",
        description: `${result.data.name} has been added to the catalogue.`,
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
  const imageRef = form.register("image");

  const isSubmitting = submissionStatus !== 'idle';

  const submitButtonText = () => {
    switch (submissionStatus) {
      case 'uploading':
        return 'Uploading Image...';
      case 'submitting':
        return 'Extracting Info...';
      default:
        return 'Submit Tool';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Submit a New AI Tool</DialogTitle>
          <DialogDescription>
            Found a cool tool? Share it with the community! We'll use AI to automatically fetch its details.
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
                      placeholder="It's great for..."
                      className="resize-none"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tool Image (Optional)</FormLabel>
                  <FormControl>
                    <Input type="file" accept="image/*" {...imageRef} disabled={isSubmitting} />
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
                {submitButtonText()}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
