// src/components/dashboard/DashboardOverview.tsx
import React from 'react';
import { useContext } from 'react';
import { 
  Award, 
  Calendar, 
  Circle, 
  ArrowUpRight, 
  BarChart,
  Sparkles, 
  BookOpen, 
  ChevronRight 
} from 'lucide-react';
import { UserContext } from '../../context/UserContext';
import { useDashboard } from '../../hooks/useDashboard';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const DashboardOverview: React.FC = () => {
  const { userProfile } = useContext(UserContext);
  const userId = userProfile?.userId || '';
  
  const { dashboardData, loading, error } = useDashboard(userId);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="bg-red-900/30 border border-red-700 text-white p-8 rounded-md max-w-md">
          <h3 className="text-xl font-bold mb-4">Error Loading Dashboard</h3>
          <p>{error}</p>
          <Button 
            className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }
  
  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">No Data Available</h3>
          <p className="text-purple-300 mb-8">We couldn't find any learning data for your account.</p>
          <Button 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            onClick={() => window.location.href = '/'}
          >
            Start Your Learning Journey
          </Button>
        </div>
      </div>
    );
  }
  
  // Destructure dashboard data for easier access
  const { 
    days_completed, 
    streak_days, 
    overall_completion_rate, 
    badge_count,
    upcoming_skills,
    skill_categories
  } = dashboardData;
  
  // Get a random inspirational quote
  const INSPIRATION_QUOTES = [
    { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { quote: "Continuous learning is the minimum requirement for success in any field.", author: "Brian Tracy" },
    { quote: "Skill is only developed by hours and hours of work.", author: "Usain Bolt" },
    { quote: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  ];
  const randomQuote = INSPIRATION_QUOTES[Math.floor(Math.random() * INSPIRATION_QUOTES.length)];
  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Section */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black to-indigo-900/10"></div>
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: 'linear-gradient(to right, #6b46c1 1px, transparent 1px), linear-gradient(to bottom, #6b46c1 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            backgroundPosition: 'center center'
          }} />
        </div>
        
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
              onClick={() => window.location.href = '/'}
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
                  Learning: <span className="text-white font-medium">
                    {dashboardData.skill_maps?.[0]?.name || "Skill Mastery"}
                  </span>
                </p>
                <div className="mt-2">
                  <Badge className="bg-purple-600 hover:bg-purple-700 mr-2">
                    Day {days_completed}/30
                  </Badge>
                  <Badge className="bg-indigo-600 hover:bg-indigo-700">
                    {badge_count} Badges
                  </Badge>
                </div>
              </div>
              
              <div className="md:text-right mt-4 md:mt-0">
                <div className="text-sm text-purple-300">Overall Completion</div>
                <div className="text-3xl font-bold text-white mb-1">{overall_completion_rate}%</div>
                <Progress value={overall_completion_rate} className="w-full md:w-32 h-2 bg-purple-950/50" />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Dashboard Content */}
      <section className="relative pb-20">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-purple-900/20 to-black"></div>
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
                        strokeDasharray={`${(days_completed/30) * 377} 377`}
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
                      <div className="text-4xl font-bold">{days_completed}</div>
                      <div className="text-sm text-purple-300">days</div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-purple-300">Day Completion Rate</span>
                  <span className="font-medium">{Math.round((days_completed/30) * 100)}%</span>
                </div>
                <Progress value={(days_completed/30) * 100} className="h-2 bg-purple-950/50" />
              </CardContent>
              <CardFooter className="text-sm text-purple-300">
                {30 - days_completed} days remaining to complete your challenge
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
                  {skill_categories.map((category, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{category.name}</span>
                        <span className="font-medium">{category.count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-purple-950/50">
                        <div 
                          className={`h-full rounded-full bg-gradient-to-r ${category.color}`}
                          style={{ width: `${category.completion_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="text-sm text-purple-300">
                <div className="flex items-center">
                  <Award className="mr-2 h-4 w-4 text-yellow-500" />
                  {badge_count} badges earned so far
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
                  onClick={() => window.location.reload()}
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
                  {upcoming_skills.length > 0 ? (
                    upcoming_skills.map((skill) => (
                      <div key={skill.id} className="flex items-center p-3 rounded-md bg-purple-950/20 border border-purple-800/30">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-center mr-3">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div className="flex-grow">
                          <div className="font-medium">{skill.name}</div>
                          <div className="text-sm text-purple-300">
                            <Badge className="bg-blue-900 hover:bg-blue-800 text-xs mr-2">
                              {skill.completion_percentage}% Complete
                            </Badge>
                            {Math.round(skill.estimated_time_remaining / 60)} hours remaining
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-purple-400" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-purple-300 py-8">
                      No upcoming skills found. Start learning to see skills here!
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="text-sm text-purple-300">
                Plan your schedule to accommodate these upcoming skills
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
                      <span className="font-medium">{overall_completion_rate}%</span>
                    </div>
                    <Progress value={overall_completion_rate} className="h-2 bg-purple-950/50" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Days Completed</span>
                      <span className="font-medium">{Math.round((days_completed/30) * 100)}%</span>
                    </div>
                    <Progress value={(days_completed/30) * 100} className="h-2 bg-purple-950/50" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Badges Earned</span>
                      <span className="font-medium">{Math.round((badge_count/10) * 100)}%</span>
                    </div>
                    <Progress value={(badge_count/10) * 100} className="h-2 bg-purple-950/50" />
                  </div>
                  
                  <div className="pt-4 text-center">
                    <div className="text-xl font-bold mb-1">
                      {Math.round((overall_completion_rate + (days_completed/30) * 100 + (badge_count/10) * 100) / 3)}%
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

export default DashboardOverview;