"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react"

interface ScoreDisplayProps {
  score: number
  nutritionalData: any
}

export function ScoreDisplay({ score, nutritionalData }: ScoreDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-chart-1"
    if (score >= 60) return "text-chart-3"
    return "text-destructive"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    if (score >= 40) return "Fair"
    return "Poor"
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
  }

  const positiveFactors = []
  const negativeFactors = []

  // Analyze positive factors
  if (nutritionalData.protein >= 8) {
    positiveFactors.push({ text: "Good protein content", icon: CheckCircle })
  }
  if (nutritionalData.fiber >= 3) {
    positiveFactors.push({ text: "High fiber content", icon: CheckCircle })
  }
  if (nutritionalData.saturatedFat <= 3) {
    positiveFactors.push({ text: "Low saturated fat", icon: CheckCircle })
  }
  if (nutritionalData.sodium <= 300) {
    positiveFactors.push({ text: "Low sodium content", icon: CheckCircle })
  }

  // Analyze negative factors
  if (nutritionalData.saturatedFat > 5) {
    negativeFactors.push({ text: "High saturated fat", icon: AlertTriangle })
  }
  if (nutritionalData.sodium > 400) {
    negativeFactors.push({ text: "High sodium content", icon: AlertTriangle })
  }
  if (nutritionalData.sugars > 15) {
    negativeFactors.push({ text: "High sugar content", icon: AlertTriangle })
  }
  if (nutritionalData.transFat > 0) {
    negativeFactors.push({ text: "Contains trans fat", icon: AlertTriangle })
  }

  return (
    <div className="space-y-6">
      {/* Main Score Display */}
      <Card className="p-6 text-center">
        <div className="space-y-4">
          <div>
            <div className={`text-6xl font-bold ${getScoreColor(score)}`}>{score}</div>
            <div className="text-lg text-muted-foreground">out of 100</div>
          </div>

          <Badge variant={getScoreBadgeVariant(score)} className="text-sm px-3 py-1">
            {getScoreLabel(score)}
          </Badge>

          <Progress value={score} className="w-full h-3" />

          <p className="text-sm text-muted-foreground max-w-md mx-auto text-pretty">
            This score is based on nutritional content, ingredient quality, and overall health impact.
          </p>
        </div>
      </Card>

      {/* Score Breakdown */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Positive Factors */}
        {positiveFactors.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold text-chart-1 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Positive Factors
            </h3>
            <div className="space-y-2">
              {positiveFactors.map((factor, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <factor.icon className="h-4 w-4 text-chart-1" />
                  <span>{factor.text}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Negative Factors */}
        {negativeFactors.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold text-destructive mb-3 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Areas of Concern
            </h3>
            <div className="space-y-2">
              {negativeFactors.map((factor, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <factor.icon className="h-4 w-4 text-destructive" />
                  <span>{factor.text}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Score Explanation */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">How This Score is Calculated</h3>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>Our scoring algorithm considers multiple factors:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Macronutrient balance (protein, carbs, fats)</li>
            <li>Harmful ingredients (trans fats, excessive sodium, added sugars)</li>
            <li>Beneficial nutrients (fiber, vitamins, minerals)</li>
            <li>Processing level and ingredient quality</li>
            <li>Overall nutritional density per calorie</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}
