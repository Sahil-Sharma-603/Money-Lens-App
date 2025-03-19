'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '../../components/Card';
import styles from '../../assets/page.module.css';
import BarChart from '../dashboard/components/BarChartComponent';
import CategoryPieChart from './components/CategoryPieChart'; 
import Greeting from './components/Greeting'; 
import Breakdown from './components/Breakdown';
import RecurringExpenses from './components/RecurringExpenses'; 
import { apiRequest, UserResponse, AnalysisResponse, DashboardResponse } from '@/app/assets/utilities/API_HANDLER';




export default function Analysis() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  
  useEffect(() => {
    // Check if token exists in localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      
      // If no token is found, redirect to login page
      if (!token) {
        router.push('/');
      } else {
        // Only set checking to false if we have a token
        // This prevents flashing of content before redirect
        setIsCheckingAuth(false);
      }
    }
  }, [router]);

  useEffect(() => {
    console.log("isCheckingAuth:", isCheckingAuth);

    if (!isCheckingAuth) {
      const fetchUser = async () => {
        try {
          const data = await apiRequest<UserResponse>('/users/user', { method: 'GET' });
          setUser(data);
          console.log("User info set", data); 
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      };
  
      const fetchAnalysisData = async () => {
        try {
          console.log("fetching analysis data"); 

          // const response = await fetch('/analytics/analytics');
          // const data = await response.json();
          // console.log(data); // Check data structure
          // setAnalysisData(data);



          const data = await apiRequest<AnalysisResponse>('/analytics/analytics', { method: 'GET' });
          console.log("Analysis Data:", data);  // Debugging step
          setAnalysisData(data);
        } catch (error) {
          console.error('Error fetching analysis data:', error);
        }
      }; 

      console.log("fetching user")
      fetchUser();
// console.log("fetching analysis data")
      fetchAnalysisData(); 
    }
  }, [isCheckingAuth]);

  useEffect(() => {
    console.log("User:", user);
    console.log("Analysis Data:", analysisData);
  }, [user, analysisData]);
  
  
    
  
  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className={styles.dashboard}>
        <Card className={styles.fullPageCard}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <p>Loading...</p>
          </div>
        </Card>
      </div>
    );
  }


    return (
      <div className={styles.dashboard}>
      <Card className={styles.fullPageCard}>
        <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Greeting userName={user ? user.firstName : ''} />
          {/* <Breakdown /> */}
          <BarChart monthlySpending={analysisData?.monthlySpending || []}/>
        </div>
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', marginLeft: 10 }}>
          <CategoryPieChart spendingByCategory={analysisData?.spendingByCategory || []}/>
        </div>
      </Card>
    </div>
  );
}