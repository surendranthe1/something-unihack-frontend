"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  const tickMarks = [0, 25, 50, 75, 100]

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-[#2a2a2a]">
        <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-red-500 via-yellow-500 to-[#58f2a9] rounded-full" />
        {tickMarks.map((mark) => (
          <div key={mark} className="absolute w-0.5 h-2.5 bg-[#4a4a4a] -top-0.5" style={{ left: `${mark}%` }} />
        ))}
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-[#2a2a2a] bg-white shadow-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58f2a9] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }

