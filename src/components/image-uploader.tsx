
"use client";

import * as React from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { storage } from "@/lib/firebase/client";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { updateToolImage } from "@/app/actions";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { UploadCloud } from "lucide-react";
import type { Tool } from "@/lib/types";

interface ImageUploaderProps {
  toolId: string;
  onUploadComplete: (updatedTool: Tool) => void;
}

export function ImageUploader({ toolId, onUploadComplete }: ImageUploaderProps) {
  const [uploadProgress, setUploadProgress] = React.useState<number | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleUpload = (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const storageRef = ref(storage, `tool-images/${toolId}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: "Could not upload the image. Please try again.",
        });
        setIsUploading(false);
        setUploadProgress(null);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const result = await updateToolImage({ toolId, imageUrl: downloadURL });

        if (result.success && result.data) {
          onUploadComplete(result.data);
        } else {
          toast({
            variant: "destructive",
            title: "Update Failed",
            description: result.error,
          });
        }
        setIsUploading(false);
        setUploadProgress(null);
      }
    );
  };

  return (
    <div className="mt-2">
      <div
        onClick={!isUploading ? handleUploadClick : undefined}
        className={cn(
          "w-full border-2 border-dashed rounded-md p-4 text-center",
          !isUploading
            ? "cursor-pointer hover:border-primary hover:bg-accent"
            : "opacity-50 pointer-events-none"
        )}
      >
        <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground" />
        <span className="mt-2 block text-sm font-semibold text-foreground">
          Click to upload a new image
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
        onChange={handleFileSelect}
        accept="image/png, image/jpeg, image/gif"
        disabled={isUploading}
      />
      {isUploading && uploadProgress !== null && (
        <div className="mt-4 w-full">
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-center text-sm text-muted-foreground mt-2">
            {Math.round(uploadProgress)}% uploaded
          </p>
        </div>
      )}
    </div>
  );
}
