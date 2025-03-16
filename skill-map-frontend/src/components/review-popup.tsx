import { useState } from "react"
import { X, Frown, Smile } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/slider"
import { cn } from "@/lib/utils"

interface ReviewPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (ratings: { overall: number; resources: number; project: number }) => void
}

export function ReviewPopup({ open, onOpenChange, onSubmit }: ReviewPopupProps) {
  const [overallFeeling, setOverallFeeling] = useState(70)
  const [resourcesFeeling, setResourcesFeeling] = useState(70)
  const [projectFeeling, setProjectFeeling] = useState(70)

  const getEmojiColor = (value: number) => {
    if (value < 33) return "text-red-500"
    if (value < 66) return "text-yellow-500"
    return "text-green-500"
  }

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit({
        overall: overallFeeling,
        resources: resourcesFeeling,
        project: projectFeeling,
      })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0f1729] border-[#2a2a2a] text-white max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)] p-6">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute left-4 top-4 p-1 text-gray-400 hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="pt-8 space-y-8">
          <h2 className="text-3xl font-bold text-[#58f2a9]">Day 1 Review</h2>

          <div className="space-y-2">
            <h3 className="text-xl">How are you feeling overall today?</h3>
            <div className="pt-4 pb-2">
              <Slider
                value={[overallFeeling]}
                onValueChange={(value) => setOverallFeeling(value[0])}
                max={100}
                step={1}
                className="py-4"
              />
              <div className="flex justify-between mt-1">
                <Frown className={cn("h-6 w-6", getEmojiColor(overallFeeling))} />
                <Smile className={cn("h-6 w-6", getEmojiColor(overallFeeling))} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl">How do you feel about todays resources?</h3>
            <div className="pt-4 pb-2">
              <Slider
                value={[resourcesFeeling]}
                onValueChange={(value) => setResourcesFeeling(value[0])}
                max={100}
                step={1}
                className="py-4"
              />
              <div className="flex justify-between mt-1">
                <Frown className={cn("h-6 w-6", getEmojiColor(resourcesFeeling))} />
                <Smile className={cn("h-6 w-6", getEmojiColor(resourcesFeeling))} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl">How do you feel with todays project?</h3>
            <div className="pt-4 pb-2">
              <Slider
                value={[projectFeeling]}
                onValueChange={(value) => setProjectFeeling(value[0])}
                max={100}
                step={1}
                className="py-4"
              />
              <div className="flex justify-between mt-1">
                <Frown className={cn("h-6 w-6", getEmojiColor(projectFeeling))} />
                <Smile className={cn("h-6 w-6", getEmojiColor(projectFeeling))} />
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              onClick={handleSubmit}
              className="bg-[#58f2a9] text-black hover:bg-[#4ad396] rounded-full px-8 py-6 text-xl"
            >
              Finish Review
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

