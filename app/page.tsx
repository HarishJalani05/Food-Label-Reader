"use client"

import { useState } from "react"
import { ImageUpload } from "@/components/image-upload"
import { TextCorrection } from "@/components/text-correction"
import { NutritionalAnalysis } from "@/components/nutritional-analysis"
import { ScoreDisplay } from "@/components/score-display"
import { AlternativesSuggestion } from "@/components/alternatives-suggestion"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Scan, FileText, BarChart3, Star, Lightbulb } from "lucide-react"

export default function FoodLabelReader() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [extractedText, setExtractedText] = useState<string>("")
  const [correctedText, setCorrectedText] = useState<string>("")
  const [nutritionalData, setNutritionalData] = useState<any>(null)
  const [healthScore, setHealthScore] = useState<number>(0)
  const [currentStep, setCurrentStep] = useState<string>("upload")

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl)
    // Simulate OCR text extraction
    const mockExtractedText = `NUTRITION FACTS
Serving Size 1 cup (240ml)
Servings Per Container 2

Amount Per Serving
Calories 150
Total Fat 8g
Saturated Fat 3g
Trans Fat 0g
Cholesterol 30mg
Sodium 470mg
Total Carbohydrate 17g
Dietary Fiber 0g
Total Sugars 12g
Protein 8g

INGREDIENTS: Milk, Sugar, Cocoa Powder, Natural Flavors, Carrageenan, Vitamin D3`

    setExtractedText(mockExtractedText)
    setCorrectedText(mockExtractedText)
    setCurrentStep("correct")
  }

  const handleTextCorrection = (corrected: string) => {
    setCorrectedText(corrected)

    // Parse nutritional data from corrected text
    const mockNutritionalData = {
      calories: 150,
      totalFat: 8,
      saturatedFat: 3,
      transFat: 0,
      cholesterol: 30,
      sodium: 470,
      totalCarbs: 17,
      fiber: 0,
      sugars: 12,
      protein: 8,
      ingredients: ["Milk", "Sugar", "Cocoa Powder", "Natural Flavors", "Carrageenan", "Vitamin D3"],
    }

    setNutritionalData(mockNutritionalData)

    // Calculate health score (simplified algorithm)
    let score = 50 // Base score
    score -= mockNutritionalData.saturatedFat * 2 // Penalize saturated fat
    score -= mockNutritionalData.sodium / 20 // Penalize sodium
    score -= mockNutritionalData.sugars * 1.5 // Penalize sugar
    score += mockNutritionalData.protein * 2 // Reward protein
    score += mockNutritionalData.fiber * 3 // Reward fiber

    setHealthScore(Math.max(0, Math.min(100, Math.round(score))))
    setCurrentStep("analyze")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Scan className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">NutriScan</h1>
              <p className="text-sm text-muted-foreground">Smart food label analysis</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={currentStep} onValueChange={setCurrentStep} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Scan className="h-4 w-4" />
              <span className="hidden sm:inline">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="correct" disabled={!uploadedImage} className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Correct</span>
            </TabsTrigger>
            <TabsTrigger value="analyze" disabled={!correctedText} className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analyze</span>
            </TabsTrigger>
            <TabsTrigger value="score" disabled={!nutritionalData} className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Score</span>
            </TabsTrigger>
            <TabsTrigger value="alternatives" disabled={!nutritionalData} className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Alternatives</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-balance">Upload Food Label</h2>
              <p className="text-muted-foreground mb-6 text-pretty">
                Take a photo or upload an image of a nutrition label to get started with the analysis.
              </p>
              <ImageUpload onImageUpload={handleImageUpload} />
            </Card>
          </TabsContent>

          <TabsContent value="correct" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-balance">Review & Correct Text</h2>
              <p className="text-muted-foreground mb-6 text-pretty">
                Review the extracted text and make any necessary corrections for accurate analysis.
              </p>
              <TextCorrection extractedText={extractedText} onTextCorrection={handleTextCorrection} />
            </Card>
          </TabsContent>

          <TabsContent value="analyze" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-balance">Nutritional Analysis</h2>
              <p className="text-muted-foreground mb-6 text-pretty">
                Detailed breakdown of nutritional content and ingredient analysis.
              </p>
              {nutritionalData && <NutritionalAnalysis data={nutritionalData} />}
            </Card>
          </TabsContent>

          <TabsContent value="score" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-balance">Health Score</h2>
              <p className="text-muted-foreground mb-6 text-pretty">
                Overall health rating based on nutritional content and ingredient quality.
              </p>
              <ScoreDisplay score={healthScore} nutritionalData={nutritionalData} />
            </Card>
          </TabsContent>

          <TabsContent value="alternatives" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-balance">Healthier Alternatives</h2>
              <p className="text-muted-foreground mb-6 text-pretty">
                Discover better options and suggestions to improve your nutrition.
              </p>
              {nutritionalData && <AlternativesSuggestion nutritionalData={nutritionalData} />}
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
