import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTalentFiles } from "@/hooks/useTalentFiles";
import { useResumeUpload } from "@/hooks/useResumeUpload";
import { Upload, File, Trash2, Download } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ResumeStepProps {
  onBack: () => void;
  onFinish: () => void;
}

export function ResumeStep({ onBack, onFinish }: ResumeStepProps) {
  const { resume, isLoading } = useTalentFiles();
  const { uploadResume, deleteResume, isUploading, isDeleting } = useResumeUpload();
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        uploadResume(e.dataTransfer.files[0]);
      }
    },
    [uploadResume]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        uploadResume(e.target.files[0]);
        // Reset input so the same file can be uploaded again if needed
        e.target.value = '';
      }
    },
    [uploadResume]
  );

  const handleDelete = () => {
    if (resume) {
      deleteResume(resume.id);
    }
  };

  const handleDownload = () => {
    if (resume) {
      window.open(resume.file_url, "_blank");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Upload Your Resume</h3>
        <p className="text-sm text-muted-foreground">
          Upload a PDF of your resume (max 5MB). This helps recruiters understand your background.
        </p>
      </div>

      {resume ? (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <File className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">{resume.file_name}</p>
                <p className="text-sm text-muted-foreground">
                  {(resume.file_size! / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-2">
            Drag and drop your resume here, or
          </p>
          <label htmlFor="resume-upload">
            <Button type="button" variant="outline" disabled={isUploading} asChild>
              <span>Browse Files</span>
            </Button>
            <input
              id="resume-upload"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
          <p className="text-xs text-muted-foreground mt-2">PDF only, max 5MB</p>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          onClick={onFinish}
          disabled={!resume || isUploading}
        >
          Finish Profile
        </Button>
      </div>
    </div>
  );
}
