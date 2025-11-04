import { useTalentFiles } from "@/hooks/useTalentFiles";
import { useResumeUpload } from "@/hooks/useResumeUpload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2, Upload } from "lucide-react";
import { useRef } from "react";

export function ResumeEditor() {
  const { resume } = useTalentFiles();
  const { uploadResume, deleteResume, isUploading, isDeleting } = useResumeUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadResume(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = () => {
    if (resume && confirm("Are you sure you want to delete your resume?")) {
      deleteResume(resume.id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Resume
        </CardTitle>
        <CardDescription>Upload your latest resume (PDF only, max 5MB)</CardDescription>
      </CardHeader>
      <CardContent>
        {resume ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{resume.file_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {resume.file_size ? `${(resume.file_size / 1024).toFixed(0)} KB` : ""}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(resume.file_url, "_blank")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>

            <div className="text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="resume-replace"
              />
              <label htmlFor="resume-replace">
                <Button variant="outline" asChild disabled={isUploading}>
                  <span className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? "Uploading..." : "Replace Resume"}
                  </span>
                </Button>
              </label>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              No resume uploaded yet
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="resume-upload"
            />
            <label htmlFor="resume-upload">
              <Button variant="outline" asChild disabled={isUploading}>
                <span className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? "Uploading..." : "Upload Resume"}
                </span>
              </Button>
            </label>
            <p className="text-xs text-muted-foreground mt-2">PDF only, max 5MB</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
