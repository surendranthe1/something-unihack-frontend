// src/pages/UserDashboard.tsx
import React, { useContext, useEffect, useState } from 'react';
import { BarChart, Circle, ArrowUpRight, Award, Calendar, BookOpen, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import SciFiBackground from '../components/shared/SciFiBackground';
import { UserContext } from '../context/UserContext';
import { useSkillContext } from '../context/SkillContext';
import { SkillNode } from '../types';

// Types for our dashboard items
interface UpcomingSkill {
  id: string;
  name: string;
  days: number;
  difficulty: string;
}

interface CompletedSkill {
  id: string;
  name: string;
  daysAgo: number;
  masteryLevel: number;
}

interface SkillCategory {
  name: string;
  count: number;
  color: string;
}

// Mock quotes for inspiration
const INSPIRATION_QUOTES = [
  { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "Continuous learning is the minimum requirement for success in any field.", author: "Brian Tracy" },
  { quote: "Skill is only developed by hours and hours of work.", author: "Usain Bolt" },
  { quote: "The expert in anything was once a beginner.", author: "Helen Hayes" },
];

const UserDashboard: React.FC = () => {
  const { userProfile } = useContext(UserContext);
  const { skillMap } = useSkillContext();
  const [randomQuote, setRandomQuote] = useState(INSPIRATION_QUOTES[0]);
  const [completionRate, setCompletionRate] = useState(0);
  const [daysCompleted, setDaysCompleted] = useState(0);
  const [badgeCount, setBadgeCount] = useState(0);
  const [upcomingSkills, setUpcomingSkills] = useState<UpcomingSkill[]>([]);
  const [completedSkills, setCompletedSkills] = useState<CompletedSkill[]>([]);
  
  // Calculate skill metrics based on skillMap
  useEffect(() => {
    if (skillMap) {
      // Simulate progress calculation
      const completedSkills = Math.floor(30 * Math.random() * 0.7); // Random completion for demo
      setCompletionRate(Math.round((completedSkills / 30) * 100));
      
      // Simulate day completion (out of 30)
      setDaysCompleted(Math.floor(Math.random() * 17) + 1); // Random between 1-17
      
      // Calculate badges (simulate achievement system)
      setBadgeCount(Math.floor(Math.random() * 5) + 1); // Random between 1-5
      
      // Set a random inspiration quote
      const randomIndex = Math.floor(Math.random() * INSPIRATION_QUOTES.length);
      setRandomQuote(INSPIRATION_QUOTES[randomIndex]);
      
      // Create upcoming skills and completed skills arrays
      if (skillMap.nodes) {
        // Convert nodes object to array for manipulation
        const nodesArray = Object.values(skillMap.nodes);
        
        // Create upcoming skills
        const upcoming = nodesArray.slice(0, 3).map((node: SkillNode) => ({
          id: node.id,
          name: node.name, // Using name property from SkillNode
          days: Math.floor(Math.random() * 5) + 1, // Random days until start
          difficulty: ["Beginner", "Intermediate", "Advanced"][Math.floor(Math.random() * 3)]
        }));
        setUpcomingSkills(upcoming);
        
        // Create completed skills
        const completed = nodesArray.slice(3, 7).map((node: SkillNode) => ({
          id: node.id,
          name: node.name, // Using name property from SkillNode
          daysAgo: Math.floor(Math.random() * 14) + 1, // Completed 1-14 days ago
          masteryLevel: Math.floor(Math.random() * 100) + 1 // Random mastery level
        }));
        setCompletedSkills(completed);
      }
    }
  }, [skillMap]);
  
  // Mock skill categories with count
  const skillCategories: SkillCategory[] = [
    { name: "Core Fundamentals", count: 4, color: "from-pink-500 to-purple-600" },
    { name: "Practical Application", count: 3, color: "from-blue-500 to-indigo-600" },
    { name: "Advanced Techniques", count: 2, color: "from-green-500 to-teal-600" },
    { name: "Expert Level", count: 1, color: "from-yellow-500 to-amber-600" },
  ];
  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Section */}
      <section className="relative py-12 overflow-hidden">
        <SciFiBackground variation="darker" />
        <div className="container relative z-10 px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
                Dashboard
              </h1>
              <p className="text-purple-200">
                Track your 30-day mastery journey
              </p>
            </div>
            
            <Button 
              className="mt-4 md:mt-0 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              onClick={() => window.history.back()}
            >
              Return to Learning Path
            </Button>
          </div>
          
          {/* User Info Section */}
          <div className="bg-black/60 border border-purple-800/40 rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-3xl font-bold">
                {userProfile?.userId ? userProfile.userId.charAt(0).toUpperCase() : "U"}
              </div>
              
              <div className="flex-grow">
                <h2 className="text-2xl font-bold text-white">
                  {userProfile?.userId || "User"}
                </h2>
                <p className="text-purple-200">
                  Learning: <span className="text-white font-medium">{skillMap?.rootSkill || "Skill"}</span>
                </p>
                <div className="mt-2">
                  <Badge className="bg-purple-600 hover:bg-purple-700 mr-2">Day {daysCompleted}/30</Badge>
                  <Badge className="bg-indigo-600 hover:bg-indigo-700">{badgeCount} Badges</Badge>
                </div>
              </div>
              
              <div className="md:text-right mt-4 md:mt-0">
                <div className="text-sm text-purple-300">Overall Completion</div>
                <div className="text-3xl font-bold text-white mb-1">{completionRate}%</div>
                <Progress value={completionRate} className="w-full md:w-32 h-2 bg-purple-950/50" />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Dashboard Content */}
      <section className="relative pb-20">
        <SciFiBackground variation="alt" />
        <div className="container relative z-10 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Completion Stats */}
            <Card className="bg-black/60 border-purple-800/40 text-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 text-purple-400" />
                  30 Day Challenge
                </CardTitle>
                <CardDescription className="text-purple-300">
                  Your daily progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center relative">
                    <svg className="w-36 h-36">
                      <circle 
                        cx="72" 
                        cy="72" 
                        r="60" 
                        fill="none" 
                        stroke="#312e81" 
                        strokeWidth="8"
                      />
                      <circle 
                        cx="72" 
                        cy="72" 
                        r="60" 
                        fill="none" 
                        stroke="url(#gradient)" 
                        strokeWidth="8"
                        strokeDasharray={`${(daysCompleted/30) * 377} 377`}
                        strokeDashoffset="0"
                        transform="rotate(-90 72 72)"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#9333ea" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                      <div className="text-4xl font-bold">{daysCompleted}</div>
                      <div className="text-sm text-purple-300">days</div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-purple-300">Day Completion Rate</span>
                  <span className="font-medium">{Math.round((daysCompleted/30) * 100)}%</span>
                </div>
                <Progress value={(daysCompleted/30) * 100} className="h-2 bg-purple-950/50" />
              </CardContent>
              <CardFooter className="text-sm text-purple-300">
                {30 - daysCompleted} days remaining to complete your challenge
              </CardFooter>
            </Card>
            
            {/* Skills Breakdown */}
            <Card className="bg-black/60 border-purple-800/40 text-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart className="mr-2 text-purple-400" />
                  Skills Breakdown
                </CardTitle>
                <CardDescription className="text-purple-300">
                  Categories of skills you're learning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {skillCategories.map((category, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{category.name}</span>
                        <span className="font-medium">{category.count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-purple-950/50">
                        <div 
                          className={`h-full rounded-full bg-gradient-to-r ${category.color}`}
                          style={{ width: `${(category.count / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="text-sm text-purple-300">
                <div className="flex items-center">
                  <Award className="mr-2 h-4 w-4 text-yellow-500" />
                  {badgeCount} badges earned so far
                </div>
              </CardFooter>
            </Card>
            
            {/* Inspiration Quote */}
            <Card className="bg-black/60 border-purple-800/40 text-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="mr-2 text-purple-400" />
                  Daily Inspiration
                </CardTitle>
                <CardDescription className="text-purple-300">
                  Wisdom to guide your journey
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-40">
                <blockquote className="text-center">
                  <p className="text-lg font-medium mb-2">"{randomQuote.quote}"</p>
                  <footer className="text-sm text-purple-300">— {randomQuote.author}</footer>
                </blockquote>
              </CardContent>
              <CardFooter className="justify-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-950/30"
                  onClick={() => {
                    const randomIndex = Math.floor(Math.random() * INSPIRATION_QUOTES.length);
                    setRandomQuote(INSPIRATION_QUOTES[randomIndex]);
                  }}
                >
                  New Quote
                </Button>
              </CardFooter>
            </Card>
            
            {/* Upcoming Skills */}
            <Card className="bg-black/60 border-purple-800/40 text-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ArrowUpRight className="mr-2 text-purple-400" />
                  Upcoming Skills
                </CardTitle>
                <CardDescription className="text-purple-300">
                  Next in your learning journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingSkills.map((skill: UpcomingSkill) => (
                    <div key={skill.id} className="flex items-center p-3 rounded-md bg-purple-950/20 border border-purple-800/30">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-center mr-3">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div className="flex-grow">
                        <div className="font-medium">{skill.name}</div>
                        <div className="text-sm text-purple-300">
                          <Badge className="bg-blue-900 hover:bg-blue-800 text-xs mr-2">
                            {skill.difficulty}
                          </Badge>
                          Starting in {skill.days} day{skill.days !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-purple-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="text-sm text-purple-300">
                Plan your schedule to accommodate these upcoming skills
              </CardFooter>
            </Card>
            
            {/* Latest Achievements */}
            <Card className="bg-black/60 border-purple-800/40 text-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 text-purple-400" />
                  Latest Achievements
                </CardTitle>
                <CardDescription className="text-purple-300">
                  Recently completed skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedSkills.map((skill: CompletedSkill) => (
                    <div key={skill.id} className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-teal-600 flex items-center justify-center mr-3">
                        <Circle className="h-5 w-5" />
                      </div>
                      <div className="flex-grow">
                        <div className="font-medium flex items-center">
                          {skill.name}
                          <Badge className="ml-2 bg-green-800 hover:bg-green-700 text-xs">
                            Completed
                          </Badge>
                        </div>
                        <div className="text-sm text-purple-300">
                          {skill.daysAgo} day{skill.daysAgo !== 1 ? 's' : ''} ago · Mastery level: {skill.masteryLevel}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="text-sm text-purple-300">
                Continue practicing to maintain your mastery level
              </CardFooter>
            </Card>
            
            {/* Overall Progress */}
            <Card className="bg-black/60 border-purple-800/40 text-white col-span-1 md:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Circle className="mr-2 text-purple-400" />
                  Overall Progress
                </CardTitle>
                <CardDescription className="text-purple-300">
                  Your journey towards mastery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Skills Completed</span>
                      <span className="font-medium">{completionRate}%</span>
                    </div>
                    <Progress value={completionRate} className="h-2 bg-purple-950/50" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Days Completed</span>
                      <span className="font-medium">{Math.round((daysCompleted/30) * 100)}%</span>
                    </div>
                    <Progress value={(daysCompleted/30) * 100} className="h-2 bg-purple-950/50" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Badges Earned</span>
                      <span className="font-medium">{Math.round((badgeCount/10) * 100)}%</span>
                    </div>
                    <Progress value={(badgeCount/10) * 100} className="h-2 bg-purple-950/50" />
                  </div>
                  
                  <div className="pt-4 text-center">
                    <div className="text-xl font-bold mb-1">
                      {Math.round((completionRate + (daysCompleted/30) * 100 + (badgeCount/10) * 100) / 3)}%
                    </div>
                    <div className="text-sm text-purple-300">Average Completion</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="text-sm text-purple-300 justify-center">
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  View Detailed Report
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserDashboard;