
"use client";

import * as React from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { storage } from "@/lib/firebase/client";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { updateToolImage } from "@/app/actions";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { UploadCloud, AlertCircle } from "lucide-react";
import type { Tool } from "@/lib/types";

interface ImageUploaderProps {
  toolId: string;
  onUploadComplete: (updatedTool: Tool) => void;
}

export function ImageUploader({ toolId, onUploadComplete }: ImageUploaderProps) {
  const [uploadProgress, setUploadProgress] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUploadClick = () => {
    // Clear previous errors and trigger the file input
    setError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    // 1. Client-Side Validation
    const allowedTypes = ["image/png", "image/jpeg", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Please upload a PNG, JPG, or GIF.");
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError("File is too large. Maximum size is 10MB.");
      return;
    }

    setError(null);
    setUploadProgress(0);

    // 2. Upload to Firebase Storage
    const storageRef = ref(storage, `tool-images/${toolId}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    // 3. Track Upload Progress
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (uploadError) => {
        // Handle unsuccessful uploads
        console.error("Upload failed:", uploadError);
        setError(`Upload failed: ${uploadError.message}`);
        setUploadProgress(null);
      },
      async () => {
        // 4. Handle Completion
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const result = await updateToolImage({ toolId, imageUrl: downloadURL });

          if (result.success && result.data) {
            onUploadComplete(result.data);
            toast({
              title: "Image Updated!",
              description: "The new tool image has been saved.",
            });
          } else {
             setError(result.error || "Failed to update tool in database.");
          }
        } catch (finalError: any) {
             setError(`An unexpected error occurred: ${finalError.message}`);
        } finally {
            // Reset progress bar regardless of outcome
            setUploadProgress(null);
        }
      }
    );
  };
  
  const isUploading = uploadProgress !== null;

  return (
    <div className="mt-2 space-y-4">
      <div
        onClick={!isUploading ? handleUploadClick : undefined}
        className={cn(
          "w-full border-2 border-dashed rounded-md p-4 text-center transition-colors",
          !isUploading
            ? "cursor-pointer hover:border-primary hover:bg-accent"
            : "opacity-50 pointer-events-none bg-muted"
        )}
      >
        <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground" />
        <span className="mt-2 block text-sm font-semibold text-foreground">
          {isUploading ? `Uploading...` : "Click to upload a new image"}
        </span>
        <span className="mt-1 block text-xs text-muted-foreground">
          PNG, JPG, GIF up to 10MB
        </span>
      </div>
      <Input
        id={`image-upload-${toolId}`}
        ref={fileInputRef}
        type="file"
        className="sr-only"
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/gif"
        disabled={isUploading}
      />
      
      {isUploading && (
        <div className="w-full space-y-2">
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-center text-sm text-muted-foreground">
            {Math.round(uploadProgress ?? 0)}% uploaded
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
        </div>
      )}
    </div>
  );
}
