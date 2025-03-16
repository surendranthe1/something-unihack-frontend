// src/pages/HomePage.tsx
import React, { useState, useRef, useContext } from 'react';
import SciFiBackground from '../components/shared/SciFiBackground';
import UserProfileForm from '../components/forms/UserProfileForm';
import SkillSearchForm from '../components/forms/SkillSearchForm';
import { UserContext } from '../context/UserContext';
import { useSkillContext } from '../context/SkillContext';
import { UserProfile } from '../types';
import skillProgramService from '../services/skillProgramService';
import useApi from '../hooks/useApi';
import SkillProgramTree from '../components/skill-program/SkillProgramTree';
import PaginatedTaskListView from '../components/skill-program/PaginatedTaskListView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { GitBranchPlus, ListChecks } from 'lucide-react';

const HomePage: React.FC = () => {
  const { userProfile, setUserProfile } = useContext(UserContext);
  const { skillProgram, setSkillProgram, loading, setLoading, error, setError } = useSkillContext();
  const [skillName, setSkillName] = useState<string>('');
  const [activeView, setActiveView] = useState<string>("tree");
  
  const skillFormSectionRef = useRef<HTMLDivElement>(null);
  const profileSectionRef = useRef<HTMLDivElement>(null);
  const skillProgramSectionRef = useRef<HTMLDivElement>(null);
  
  // Use the API hook for the generateSkillProgram call
  const { execute: generateProgram } = useApi(skillProgramService.generateSkillProgram);
  
  // This flow is now reversed - skill name first, then profile
  const handleSkillNameSubmit = (name: string) => {
    setSkillName(name);
    setError(null);
    // Scroll to profile section
    setTimeout(() => {
      profileSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  const handleProfileSubmit = async (profile: UserProfile) => {
    try {
      setLoading(true);
      setError(null);
      setUserProfile(profile);
      
      // Add unique userId if not present
      if (!profile.userId) {
        profile.userId = `user-${Date.now()}`;
      }
      
      // Generate skill program with the profile
      const generatedSkillProgram = await generateProgram(
        skillName,
        profile
      );
      
      setSkillProgram(generatedSkillProgram);
      
      // Scroll to skill program section
      setTimeout(() => {
        skillProgramSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error: any) {
      console.error('Error generating skill program:', error);
      setError(error.response?.data?.error?.message || 
               error.message || 
               'Failed to generate skill program. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Skill Search Section */}
      <section ref={skillFormSectionRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        <SciFiBackground />
        <div className="container relative z-10 px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 py-6">
              30-Day Skill Challenge
            </h1>
            <p className="text-lg text-purple-200 max-w-2xl mx-auto">
              Build your skills in just 30 days with our AI-powered daily task program
            </p>
          </div>
          
          <SkillSearchForm onSearch={handleSkillNameSubmit} loading={loading} />
        </div>
      </section>
      
      {/* Profile Section - only shown after skill is entered */}
      {skillName && (
        <section ref={profileSectionRef} className="min-h-screen flex items-center justify-center bg-black relative">
          <SciFiBackground variation="alt" />
          <div className="container relative z-10 px-4 py-16">
            <UserProfileForm 
              skillName={skillName} 
              onSubmit={handleProfileSubmit} 
              loading={loading}
            />
            
            {error && (
              <div className="mt-6 max-w-3xl mx-auto bg-red-900/30 border border-red-700 text-white p-4 rounded-md">
                <h4 className="font-medium text-red-400">Error</h4>
                <p>{error}</p>
              </div>
            )}
          </div>
        </section>
      )}
      
      {/* Skill Program Section - only shown after profile is submitted and skill program is generated */}
      {skillProgram && (
        <section ref={skillProgramSectionRef} className="min-h-screen bg-black relative pb-24">
          <SciFiBackground variation="darker" />
          <div className="container relative z-10 px-4 py-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 py-6">
                Your 30-Day {skillProgram.skillName} Challenge
              </h2>
              <p className="text-lg text-purple-200 max-w-2xl mx-auto">
                Complete one task each day to master your new skill
              </p>
              
              <Tabs defaultValue="tree" onValueChange={setActiveView} className="mt-8 max-w-2xl mx-auto">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="tree" className="flex items-center gap-2">
                    <GitBranchPlus className="h-4 w-4" />
                    <span>Skill Path View</span>
                  </TabsTrigger>
                  <TabsTrigger value="list" className="flex items-center gap-2">
                    <ListChecks className="h-4 w-4" />
                    <span>Task List View</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="mt-6">
              {activeView === "tree" ? (
                <SkillProgramTree skillProgram={skillProgram} />
              ) : (
                <PaginatedTaskListView skillProgram={skillProgram} />
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;