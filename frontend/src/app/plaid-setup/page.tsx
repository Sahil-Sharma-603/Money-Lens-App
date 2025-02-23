'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePlaidLink } from 'react-plaid-link';

export default function Home() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Fetch a link token from the backend on component mount
  useEffect(() => {
    const fetchLinkToken = async () => {
      try {
        const res = await fetch(
          'http://localhost:5001/api/plaid/create_link_token',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const data = await res.json();
        if (data.link_token) {
          setLinkToken(data.link_token);
          console.log('Received link token:', data.link_token);
        } else {
          console.error('No link token in response:', data);
        }
      } catch (error) {
        console.error('Error fetching link token:', error);
      }
    };
    fetchLinkToken();
  }, []);

  const fetchStoredTransactions = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (fromDate) queryParams.append('fromDate', fromDate);
      if (toDate) queryParams.append('toDate', toDate);

      const response = await fetch(
        `http://localhost:5001/api/transactions/stored?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      setTransactions(data.transactions); // Store the transactions
      console.log('Stored transactions:', data);
      alert(`Successfully fetched ${data.count} transactions!`);
    } catch (error) {
      console.error('Error fetching stored transactions:', error);
      alert('Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const onSuccess = async (public_token: string, metadata: any) => {
    console.log('Plaid onSuccess – public_token:', public_token);
    try {
      const tokenExchangeResponse = await fetch(
        'http://localhost:5001/api/plaid/set_access_token',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ public_token }),
        }
      );

      const tokenData = await tokenExchangeResponse.json();
      console.log('Token exchange response:', tokenData);

      const jwtToken = localStorage.getItem('token');
      const transactionsResponse = await fetch(
        'http://localhost:5001/api/plaid/transactions',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const transactionsData = await transactionsResponse.json();
      console.log('Transactions received:', transactionsData);
      alert('Transactions loaded! Check the console for details.');
    } catch (error) {
      console.error('Error during Plaid flow:', error);
      alert('There was an error connecting your bank account.');
    }
  };

  const config = {
    token: linkToken!,
    onSuccess,
  };

  const { open, ready } = usePlaidLink(
    linkToken ? config : { token: '', onSuccess: () => {} }
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Bank Account Connection</h1>

      <div style={styles.section}>
        <h2 style={styles.subtitle}>Connect Bank Account</h2>
        <button
          style={styles.plaidButton}
          onClick={() => open()}
          disabled={!linkToken || !ready}
        >
          Connect a bank account
        </button>
      </div>

      <div style={styles.section}>
        <h2 style={styles.subtitle}>View Transactions</h2>
        <div style={styles.datePickerContainer}>
          <div style={styles.datePickerGroup}>
            <label style={styles.label}>From Date:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.datePickerGroup}>
            <label style={styles.label}>To Date:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={styles.input}
            />
          </div>
        </div>
        <button
          onClick={fetchStoredTransactions}
          disabled={isLoading}
          style={styles.fetchButton}
        >
          {isLoading ? 'Loading...' : 'Get Transactions'}
        </button>
      </div>

      <Link href="/dashboard">
        <button style={styles.dashboardButton}>Go to Dashboard</button>
      </Link>

      {transactions.length > 0 && (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Category</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.transaction_id}>
                  <td style={styles.td}>{transaction.date}</td>
                  <td style={styles.td}>{transaction.name}</td>
                  <td style={styles.td}>
                    ${Math.abs(transaction.amount).toFixed(2)}
                  </td>
                  <td style={styles.td}>{transaction.category.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '40px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  title: {
    fontSize: '24px',
    marginBottom: '30px',
    color: '#333',
  },
  subtitle: {
    fontSize: '20px',
    marginBottom: '15px',
    color: '#444',
  },
  section: {
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
  },
  datePickerContainer: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
  },
  datePickerGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    flex: 1,
  },
  label: {
    marginBottom: '5px',
    color: '#666',
  },
  input: {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '16px',
  },
  plaidButton: {
    backgroundColor: '#00b300',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    opacity: 1,
  },
  fetchButton: {
    backgroundColor: '#0066cc',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    width: '100%',
  },
  dashboardButton: {
    backgroundColor: '#666',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  tableContainer: {
    marginTop: '20px',
    overflowX: 'auto' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  th: {
    backgroundColor: '#f8f9fa',
    padding: '12px',
    textAlign: 'left' as const,
    borderBottom: '2px solid #dee2e6',
    color: '#495057',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #dee2e6',
    color: '#212529',
  },
};
