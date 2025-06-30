"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { CheckCircle, Edit3 } from "lucide-react"

interface TextCorrectionProps {
  extractedText: string
  onTextCorrection: (correctedText: string) => void
}

export function TextCorrection({ extractedText, onTextCorrection }: TextCorrectionProps) {
  const [text, setText] = useState(extractedText)
  const [isEditing, setIsEditing] = useState(false)

  const handleConfirm = () => {
    onTextCorrection(text)
    setIsEditing(false)
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-muted/50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Extracted Text
            </h3>
            {isEditing ? (
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
                placeholder="Edit the extracted text here..."
              />
            ) : (
              <pre className="whitespace-pre-wrap text-sm font-mono bg-background p-3 rounded border">{text}</pre>
            )}
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        {isEditing ? (
          <>
            <Button onClick={handleConfirm} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Confirm & Analyze
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleConfirm} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Text Looks Good - Analyze
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(true)} className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Edit Text
            </Button>
          </>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        <p>
          Review the extracted text above. If there are any errors from the image scanning, click "Edit Text" to make
          corrections before proceeding with the nutritional analysis.
        </p>
      </div>
    </div>
  )
}
