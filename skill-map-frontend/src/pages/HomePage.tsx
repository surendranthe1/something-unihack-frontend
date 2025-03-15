// src/pages/HomePage.tsx
import React, { useState, useRef, useContext } from 'react';
import SciFiBackground from '../components/shared/SciFiBackground';
import UserProfileForm from '../components/forms/UserProfileForm';
import SkillSearchForm from '../components/forms/SkillSearchForm';
import SkillTree from '../components/skill-tree/SkillTree';
import { UserContext } from '../context/UserContext';
import { useSkillContext } from '../context/SkillContext';
import { UserProfile } from '../types';
import skillMapService from '../services/skillMapService';
import useApi from '../hooks/useApi';
import SkillTree2 from '@/components/skill-tree/SkillTree2';

const HomePage: React.FC = () => {
  const { userProfile, setUserProfile } = useContext(UserContext);
  const { skillMap, setSkillMap, loading, setLoading, error, setError } = useSkillContext();
  const [skillName, setSkillName] = useState<string>('');
  
  const skillFormSectionRef = useRef<HTMLDivElement>(null);
  const profileSectionRef = useRef<HTMLDivElement>(null);
  const skillTreeSectionRef = useRef<HTMLDivElement>(null);
  
  // Use the API hook for the generateSkillMap call
  const { execute: generateMap } = useApi(skillMapService.generateSkillMap);
  
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
      
      // Generate skill map with the profile
      const generatedSkillMap = await generateMap(
        skillName,
        profile,
        90 // Default time frame of 90 days
      );
      
      setSkillMap(generatedSkillMap);
      
      // Scroll to skill tree section
      setTimeout(() => {
        skillTreeSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error: any) {
      console.error('Error generating skill map:', error);
      setError(error.response?.data?.error?.message || 
               error.message || 
               'Failed to generate skill map. Please try again.');
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
              Skill Path Navigator
            </h1>
            <p className="text-lg text-purple-200 max-w-2xl mx-auto">
              Build your personalized learning journey with AI-powered skill mapping
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
      
      {/* Skill Tree Section - only shown after profile is submitted and skill map is generated */}
      {skillMap && (
        <section ref={skillTreeSectionRef} className="min-h-screen bg-black relative pb-24">
          <SciFiBackground variation="darker" />
          <div className="container relative z-10 px-4 py-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 py-6">
                Your {skillMap.rootSkill} Learning Path
              </h2>
              <p className="text-lg text-purple-200 max-w-2xl mx-auto">
                Explore the nodes to see details and resources for each skill
              </p>
            </div>
            
            <SkillTree2 skillMap={skillMap} />
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;