"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star, TrendingUp, ExternalLink } from "lucide-react"

interface AlternativesSuggestionProps {
  nutritionalData: any
}

export function AlternativesSuggestion({ nutritionalData }: AlternativesSuggestionProps) {
  // Mock alternative products based on the current product type
  const alternatives = [
    {
      name: "Organic Almond Milk",
      brand: "Califia Farms",
      score: 85,
      improvements: ["Lower sugar", "No artificial ingredients", "Higher protein"],
      price: "$4.99",
      calories: 80,
      keyBenefits: ["Organic", "Non-GMO", "Fortified with vitamins"],
    },
    {
      name: "Oat Milk Original",
      brand: "Oatly",
      score: 78,
      improvements: ["Plant-based", "Lower saturated fat", "Sustainable"],
      price: "$5.49",
      calories: 120,
      keyBenefits: ["Fiber-rich", "Beta-glucan", "Environmentally friendly"],
    },
    {
      name: "Unsweetened Soy Milk",
      brand: "Silk",
      score: 82,
      improvements: ["No added sugar", "Higher protein", "Lower calories"],
      price: "$3.99",
      calories: 80,
      keyBenefits: ["Complete protein", "Fortified", "Heart healthy"],
    },
  ]

  const improvementTips = [
    {
      title: "Reduce Sugar Intake",
      description: "Look for products with less than 6g of added sugar per serving",
      icon: TrendingUp,
    },
    {
      title: "Choose Whole Ingredients",
      description: "Opt for products with recognizable, whole food ingredients",
      icon: Star,
    },
    {
      title: "Watch Sodium Levels",
      description: "Aim for products with less than 300mg sodium per serving",
      icon: TrendingUp,
    },
    {
      title: "Increase Fiber",
      description: "Select options with at least 3g of fiber per serving",
      icon: Star,
    },
  ]

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-chart-1"
    if (score >= 60) return "text-chart-3"
    return "text-destructive"
  }

  return (
    <div className="space-y-6">
      {/* Better Alternatives */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ArrowRight className="h-5 w-5 text-primary" />
          Healthier Alternatives
        </h3>
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {alternatives.map((product, index) => (
            <Card key={index} className="p-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-balance">{product.name}</h4>
                    <p className="text-sm text-muted-foreground">{product.brand}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getScoreColor(product.score)}`}>{product.score}</div>
                    <div className="text-xs text-muted-foreground">score</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{product.calories} cal</span>
                  <span className="text-primary font-medium">{product.price}</span>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Key improvements:</p>
                  <div className="flex flex-wrap gap-1">
                    {product.improvements.map((improvement, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {improvement}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Benefits:</p>
                  <div className="flex flex-wrap gap-1">
                    {product.keyBenefits.map((benefit, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Find in Store
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Improvement Tips */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Tips for Healthier Choices</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {improvementTips.map((tip, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <tip.icon className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium text-sm">{tip.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 text-pretty">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Nutritional Goals */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Based on Your Scan</h3>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>To improve your nutrition score, consider products that:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            {nutritionalData.saturatedFat > 5 && (
              <li>Have less saturated fat (currently {nutritionalData.saturatedFat}g)</li>
            )}
            {nutritionalData.sodium > 400 && <li>Contain less sodium (currently {nutritionalData.sodium}mg)</li>}
            {nutritionalData.sugars > 15 && <li>Have reduced sugar content (currently {nutritionalData.sugars}g)</li>}
            {nutritionalData.fiber < 3 && <li>Provide more dietary fiber (currently {nutritionalData.fiber}g)</li>}
            {nutritionalData.protein < 8 && (
              <li>Offer higher protein content (currently {nutritionalData.protein}g)</li>
            )}
          </ul>
        </div>
      </Card>
    </div>
  )
}
