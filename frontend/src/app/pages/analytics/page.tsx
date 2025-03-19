'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '../../components/Card';
import styles from '../../assets/page.module.css';
import BarChart from './components/BarChart'; 
import CategoryPieChart from './components/CategoryPieChart'; 
import Greeting from './components/Greeting'; 
import LargestExpense from './components/LargestExpense'; 
import NetIncome from './components/NetIncome'; 
import RecurringExpenses from './components/RecurringExpenses'; 
import TopRevenueSource from './components/TopRevenueSource'; 
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
        <div style= {{display: "flex", flexDirection: "column"}}>
          <Greeting userName={user ? user.firstName : ''} balance={analysisData?.balance ?? 0} />
          <div style = {{display: "flex", flexDirection: "row", minWidth: "1000px"}}>
            <Card > 
            <div style = {{display: "flex", flexDirection: "column", minWidth: "1000px"}}>
              <h4>Month Breakdown</h4>
              <p>Average Monthly Spending</p>
              <p>Average Monthly Earning</p>
              <p>Average Monthly Saving</p>
              <div style = {{display: "flex", flexDirection: "row", minWidth: "1000px", justifyContent: "space-between"}}>
                <div style = {{display: "flex", flexDirection: "column"}}>
                  <h4>Top Spending Sources</h4>
                </div>
                <div style = {{display: "flex", flexDirection: "column"}}>
                  <h4>Top Earning Sources</h4>
                </div>  
              </div>
            

            </div>
            </Card>
            <CategoryPieChart spendingByCategory={analysisData?.spendingByCategory || []}/>

          </div>
          <div style = {{display: "flex", flexDirection: "row", minWidth: "1000px"}}>
            <BarChart monthlySpending={analysisData?.monthlySpending || []}/>
            <RecurringExpenses recurringExpenses={analysisData?.recurringExpenses || []}/>
          

          </div>
          {/* <div>
            <LargestExpense />
            <TopRevenueSource> </TopRevenueSource>
            <NetIncome> </NetIncome>

          </div>
          <div>
            <RecurringExpenses> </RecurringExpenses>
          </div> */}
        </div>
      </Card>
    </div>
  );
}
