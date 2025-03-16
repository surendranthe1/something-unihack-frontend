// src/hooks/useDashboard.ts
import { useState, useEffect } from 'react';
import axios from 'axios';

// Types for dashboard data
export interface DashboardData {
  days_completed: number;
  streak_days: number;
  longest_streak: number;
  overall_completion_rate: number;
  badge_count: number;
  skill_maps: Array<{
    id: string;
    name: string;
    completion_rate: number;
    days_completed: number;
    last_activity: string;
  }>;
  recent_activity: Array<{
    date: string;
    minutes: number;
  }>;
  upcoming_skills: Array<{
    id: string;
    name: string;
    skill_map_id: string;
    skill_map_name: string;
    completion_percentage: number;
    estimated_time_remaining: number;
  }>;
  skill_categories: Array<{
    name: string;
    count: number;
    completed: number;
    color: string;
    completion_percentage: number;
  }>;
}

interface ApiResponse {
  success: boolean;
  data: DashboardData;
  timestamp: string;
}

// API base URL from environment or default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * Custom hook to fetch dashboard data
 */
export function useDashboard(userId: string) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get<ApiResponse>(`${API_BASE_URL}/dashboard/${userId}`);
        
        if (response.data.success) {
          setDashboardData(response.data.data);
        } else {
          setError('Failed to retrieve dashboard data');
        }
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.message || 'An error occurred while fetching dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

  return { dashboardData, loading, error };
}

/**
 * Custom hook to fetch just the quick stats
 */
export function useUserStats(userId: string) {
  const [stats, setStats] = useState<{
    overall_completion_rate: number;
    days_completed: number;
    streak_days: number;
    badge_count: number;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`${API_BASE_URL}/dashboard/${userId}/stats`);
        
        if (response.data.success) {
          setStats(response.data.data);
        } else {
          setError('Failed to retrieve user stats');
        }
      } catch (err: any) {
        console.error('Error fetching user stats:', err);
        setError(err.response?.data?.message || 'An error occurred while fetching user stats');
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [userId]);

  return { stats, loading, error };
}