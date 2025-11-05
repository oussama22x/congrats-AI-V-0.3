import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, FileText } from "lucide-react";

interface Answer {
  id: string;
  questionId: string;
  questionText: string;
  audioUrl: string;
  transcript: string | null;
  submittedAt: string;
}

interface AnswerCardProps {
  answer: Answer;
  questionNumber?: number;
}

export const AnswerCard = ({ 
  answer,
  questionNumber 
}: AnswerCardProps) => {
  const [showTranscript, setShowTranscript] = useState(false);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-start gap-3 text-lg">
          <Volume2 className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
          <span>
            {questionNumber && <span className="font-bold text-primary">Q{questionNumber}: </span>}
            {answer.questionText}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <audio 
          controls 
          src={answer.audioUrl}
          className="w-full"
          preload="metadata"
        >
          Your browser does not support the audio element.
        </audio>

        {/* Transcript Toggle Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTranscript(!showTranscript)}
          className="w-full sm:w-auto"
        >
          <FileText className="h-4 w-4 mr-2" />
          {showTranscript ? "Hide" : "Show"} AI Transcript
        </Button>

        {/* Transcript Display */}
        {showTranscript && (
          <blockquote className="border-l-4 border-primary pl-4 py-2 text-sm text-muted-foreground italic bg-muted/30 rounded-r">
            {answer.transcript || "Transcription is still processing or was not available."}
          </blockquote>
        )}
      </CardContent>
    </Card>
  );
};
