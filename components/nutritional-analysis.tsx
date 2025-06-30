"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface NutritionalData {
  calories: number
  totalFat: number
  saturatedFat: number
  transFat: number
  cholesterol: number
  sodium: number
  totalCarbs: number
  fiber: number
  sugars: number
  protein: number
  ingredients: string[]
}

interface NutritionalAnalysisProps {
  data: NutritionalData
}

export function NutritionalAnalysis({ data }: NutritionalAnalysisProps) {
  const macronutrients = [
    { name: "Carbohydrates", value: data.totalCarbs, unit: "g", color: "bg-chart-2", dailyValue: 300 },
    { name: "Protein", value: data.protein, unit: "g", color: "bg-chart-1", dailyValue: 50 },
    { name: "Total Fat", value: data.totalFat, unit: "g", color: "bg-chart-3", dailyValue: 65 },
  ]

  const micronutrients = [
    { name: "Saturated Fat", value: data.saturatedFat, unit: "g", limit: 20, isHarmful: data.saturatedFat > 5 },
    { name: "Trans Fat", value: data.transFat, unit: "g", limit: 2, isHarmful: data.transFat > 0 },
    { name: "Cholesterol", value: data.cholesterol, unit: "mg", limit: 300, isHarmful: data.cholesterol > 200 },
    { name: "Sodium", value: data.sodium, unit: "mg", limit: 2300, isHarmful: data.sodium > 400 },
    { name: "Sugars", value: data.sugars, unit: "g", limit: 50, isHarmful: data.sugars > 15 },
    { name: "Fiber", value: data.fiber, unit: "g", limit: 25, isHarmful: false },
  ]

  const harmfulIngredients = data.ingredients.filter((ingredient) =>
    ["sugar", "high fructose corn syrup", "trans fat", "artificial", "preservative"].some((harmful) =>
      ingredient.toLowerCase().includes(harmful.toLowerCase()),
    ),
  )

  const healthyIngredients = data.ingredients.filter((ingredient) =>
    ["whole", "natural", "organic", "fiber", "protein"].some((healthy) =>
      ingredient.toLowerCase().includes(healthy.toLowerCase()),
    ),
  )

  return (
    <div className="space-y-6">
      {/* Calories */}
      <Card className="p-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">{data.calories}</div>
          <div className="text-sm text-muted-foreground">Calories per serving</div>
        </div>
      </Card>

      {/* Macronutrients */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Macronutrients</h3>
        <div className="space-y-4">
          {macronutrients.map((macro) => (
            <div key={macro.name} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{macro.name}</span>
                <span className="font-medium">
                  {macro.value}
                  {macro.unit}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={(macro.value / macro.dailyValue) * 100} className="flex-1 h-2" />
                <span className="text-xs text-muted-foreground w-12">
                  {Math.round((macro.value / macro.dailyValue) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Micronutrients & Concerns */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Detailed Breakdown</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {micronutrients.map((micro) => (
            <div key={micro.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                {micro.isHarmful ? (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                ) : micro.name === "Fiber" ? (
                  <CheckCircle className="h-4 w-4 text-chart-1" />
                ) : (
                  <div className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">{micro.name}</span>
              </div>
              <div className="text-sm">
                <span className={micro.isHarmful ? "text-destructive font-medium" : ""}>
                  {micro.value}
                  {micro.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Ingredients Analysis */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Ingredients Analysis</h3>
        <div className="space-y-4">
          {harmfulIngredients.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-destructive mb-2 flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Concerning Ingredients
              </h4>
              <div className="flex flex-wrap gap-2">
                {harmfulIngredients.map((ingredient, index) => (
                  <Badge key={index} variant="destructive" className="text-xs">
                    {ingredient}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {healthyIngredients.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-chart-1 mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Positive Ingredients
              </h4>
              <div className="flex flex-wrap gap-2">
                {healthyIngredients.map((ingredient, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-chart-1/10 text-chart-1">
                    {ingredient}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium mb-2">All Ingredients</h4>
            <p className="text-xs text-muted-foreground">{data.ingredients.join(", ")}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
