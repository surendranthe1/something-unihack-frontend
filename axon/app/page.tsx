"use client"

import { useState } from "react"
import { Bookmark, Menu, SlidersHorizontal, User, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isDayPopupOpen, setIsDayPopupOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000510] to-[#0a1029] text-white">
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <h1 className="text-3xl font-bold">AXON</h1>
        <div className="flex items-center gap-6">
          <User className="w-6 h-6" />
          <Menu className="w-7 h-7" />
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-6 py-8">
        <div className="relative flex items-center rounded-full border border-[#656974] bg-black p-2 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          <span className="pl-4 pr-2 text-lg">I want to learn:</span>
          <input
            type="text"
            defaultValue="French"
            className="flex-1 bg-transparent text-xl text-[#8f939e] outline-none"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffea7b]"
            >
              <SlidersHorizontal className="h-5 w-5 text-black" />
            </button>
            <button className="rounded-full bg-[#58f2a9] px-6 py-2 text-xl font-medium text-black">Generate</button>
          </div>
        </div>
      </div>

      {/* Title Section */}
      <div className="px-6 py-4">
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <h2 className="text-3xl font-medium text-[#58f2a9]">Conversational French</h2>
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#58f2a9]"></div>
            </div>
            <span className="text-3xl font-medium">Roadmap</span>
          </div>
          <div className="absolute right-6">
            <Bookmark className="h-7 w-7" />
          </div>
        </div>
      </div>

      {/* Day 1 Button - Centered */}
      <div className="flex justify-center mt-12">
        <Button
          onClick={() => setIsDayPopupOpen(true)}
          className="bg-[#1a51f4] text-white hover:bg-[#1545d6] rounded-full px-8 py-6 text-xl"
        >
          Open Day 1
        </Button>
      </div>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="bg-[#0f1729] border-[#2a2a2a] text-white max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <DialogHeader className="relative border-none">
            <button onClick={() => setIsSettingsOpen(false)} className="absolute left-0 top-0 p-1">
              <X className="h-6 w-6" />
            </button>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h2 className="text-xl">Goal:</h2>
              <Input
                placeholder="Be specific, concise and include context clues"
                className="bg-transparent border-[#2a2a2a] text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-xl">Your Current Level:</h2>
              <Select defaultValue="beginner">
                <SelectTrigger className="bg-transparent border-[#2a2a2a] text-white w-full">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f1729] border-[#2a2a2a]">
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl">Learning Method:</h2>
              <Select defaultValue="visual-audio">
                <SelectTrigger className="bg-transparent border-[#2a2a2a] text-white w-full">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f1729] border-[#2a2a2a]">
                  <SelectItem value="visual-audio">Visual/Audio</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                  <SelectItem value="interactive">Interactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsSettingsOpen(false)}
                className="border-[#2a2a2a] text-white hover:bg-[#2a2a2a] hover:text-white"
              >
                Cancel
              </Button>
              <Button onClick={() => setIsSettingsOpen(false)} className="bg-[#58f2a9] text-black hover:bg-[#4ad396]">
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Day Popup */}
      <Dialog open={isDayPopupOpen} onOpenChange={setIsDayPopupOpen}>
        <DialogContent className="bg-[#0f1729] border-[#2a2a2a] text-white max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="relative border-none">
            <button onClick={() => setIsDayPopupOpen(false)} className="absolute left-0 top-0 p-1">
              <X className="h-6 w-6" />
            </button>

            <div className="pt-8 space-y-6">
              <h2 className="text-3xl font-bold">Day 1</h2>

              <div className="space-y-4">
                <h3 className="text-2xl">Lesson Plan</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-200">
                  <li>Learn basic greetings</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl">Resources</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-200">
                  <li>
                    YouTube:{" "}
                    <a href="#" className="text-white underline hover:text-[#58f2a9]">
                      Basic French Greetings
                    </a>
                  </li>
                  <li>
                    Lingvist:{" "}
                    <a href="#" className="text-white underline hover:text-[#58f2a9]">
                      Say Hello
                    </a>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl">Check Your Knowledge / Projects</h3>
                <p className="text-gray-200">Try introducing yourself to a friend in French</p>
              </div>

              <Button className="w-full bg-[#58f2a9] text-black hover:bg-[#4ad396] rounded-full py-6 text-xl">
                Review and Complete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

