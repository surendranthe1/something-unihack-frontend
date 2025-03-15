// src/pages/HomePage.tsx
import React, { useState, useRef, useContext } from 'react';
import SciFiBackground from '../components/shared/SciFiBackground';
import UserProfileForm from '../components/forms/UserProfileForm';
import SkillSearchForm from '../components/forms/SkillSearchForm';
import SkillTree from '../components/skill-tree/SkillTree';
import { UserContext } from '../context/UserContext';
import { UserProfile, SkillMap } from '../types';
import skillMapService from '../services/skillMapService';

const HomePage: React.FC = () => {
  const { userProfile, setUserProfile } = useContext(UserContext);
  const [skillName, setSkillName] = useState<string>('');
  const [skillMap, setSkillMap] = useState<SkillMap | null>(null);
  const [loading, setLoading] = useState(false);
  
  const skillFormSectionRef = useRef<HTMLDivElement>(null);
  const profileSectionRef = useRef<HTMLDivElement>(null);
  const skillTreeSectionRef = useRef<HTMLDivElement>(null);
  
  // This flow is now reversed - skill name first, then profile
  const handleSkillNameSubmit = (name: string) => {
    setSkillName(name);
    // Scroll to profile section
    setTimeout(() => {
      profileSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  const handleProfileSubmit = async (profile: UserProfile) => {
    try {
      setLoading(true);
      setUserProfile(profile);
      
      // Generate skill map with the profile
      const generatedSkillMap = await skillMapService.generateSkillMap(
        skillName,
        profile,
        90 // Default time frame of 90 days
      );
      
      setSkillMap(generatedSkillMap);
      
      // Scroll to skill tree section
      setTimeout(() => {
        skillTreeSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Error generating skill map:', error);
      // Handle error
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
          
          <SkillSearchForm onSearch={handleSkillNameSubmit} />
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
          </div>
        </section>
      )}
      
      {/* Skill Tree Section - only shown after profile is submitted and skill map is generated */}
      {skillMap && (
        <section ref={skillTreeSectionRef} className="min-h-screen bg-black relative pb-24">
          <SciFiBackground variation="darker" />
          <div className="container relative z-10 px-4 py-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
                Your {skillMap.rootSkill} Learning Path
              </h2>
              <p className="text-lg text-purple-200 max-w-2xl mx-auto">
                Explore the nodes to see details and resources for each skill
              </p>
            </div>
            
            <SkillTree skillMap={skillMap} />
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;