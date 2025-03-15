'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlaidAccount, usePlaidLink } from 'react-plaid-link';
import {
  apiRequest,
  uploadFile,
  PlaidAccountsResponse,
  PlaidLinkResponse,
  Transaction,
  TransactionsResponse,
  CSVImportResponse,
} from '@/app/assets/utilities/API_HANDLER';
import CSVImportForm from '@/app/components/file-import/CSVImportForm';

export default function Home() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>(''); // Added search state
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showCSVImport, setShowCSVImport] = useState(false);

  const [connectedAccounts, setConnectedAccounts] = useState<PlaidAccount[]>(
    []
  );
  const [hasPlaidConnection, setHasPlaidConnection] = useState(false);

  // Check authentication first
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
    // Only fetch Plaid data if the user is authenticated
    if (!isCheckingAuth) {
      const checkExistingAccounts = async () => {
        try {
          const data = await apiRequest<PlaidAccountsResponse>(
            '/plaid/accounts'
          );
          setConnectedAccounts(data.accounts);
          setHasPlaidConnection(data.accounts.length > 0);
        } catch (error) {
          console.error('Error checking existing accounts:', error);
          setHasPlaidConnection(false);
        }
      };

      checkExistingAccounts();
    }
  }, [isCheckingAuth]);

  useEffect(() => {
    // Only fetch link token if the user is authenticated
    if (!isCheckingAuth) {
      const fetchLinkToken = async () => {
        try {
          const data = await apiRequest<PlaidLinkResponse>(
            '/plaid/create_link_token',
            {
              method: 'POST',
            }
          );
          if (data.link_token) {
            setLinkToken(data.link_token);
            console.log('Received link token:', data.link_token);
          }
        } catch (error) {
          console.error('Error fetching link token:', error);
        }
      };
      fetchLinkToken();
    }
  }, [isCheckingAuth]);

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your bank account?')) {
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest('/plaid/disconnect', {
        method: 'POST',
      });

      // Reset states
      setConnectedAccounts([]);
      setHasPlaidConnection(false);
      setTransactions([]);

      alert('Bank account disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting account:', error);
      alert('Failed to disconnect bank account');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStoredTransactions = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (searchTerm) params.search = searchTerm; // Include search term in params

      const data = await apiRequest<TransactionsResponse>(
        '/transactions/stored',
        {
          params,
        }
      );

      setTransactions(data.transactions);
      if (data.count === 0)
        alert('No transactions found for your search criteria');
      console.log('Stored transactions:', data);
    } catch (error) {
      console.error('Error fetching stored transactions:', error);
      alert('Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const onSuccess = async (public_token: string, metadata: any) => {
    console.log('Plaid onSuccess – public_token:', public_token);
    setIsLoading(true);
    try {
      await apiRequest('/plaid/set_access_token', {
        method: 'POST',
        body: { public_token },
      });

      // Load the transactions
      const transactionsData = await apiRequest('/plaid/transactions');
      console.log('Transactions received:', transactionsData);

      // Fetch and update connected accounts immediately
      try {
        const accountsData = await apiRequest<PlaidAccountsResponse>(
          '/plaid/accounts'
        );
        setConnectedAccounts(accountsData.accounts);
        setHasPlaidConnection(accountsData.accounts.length > 0);
      } catch (error) {
        console.error('Error updating accounts after connection:', error);
      }
    } catch (error) {
      console.error('Error during Plaid flow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const config = {
    token: linkToken!,
    onSuccess,
  };

  const { open, ready } = usePlaidLink(
    linkToken ? config : { token: '', onSuccess: () => {} }
  );

  const handleCSVImportSuccess = () => {
    setShowCSVImport(false);
    alert('Transactions imported successfully');
    // Optionally refresh the transactions list
    fetchStoredTransactions();
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div style={styles.container}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {isLoading && (
        <div style={styles.loaderStyle}>
          Loading your transactions, please wait...
        </div>
      )}
      <h1 style={styles.title}>Bank Account Connection</h1>
      <button
        style={styles.importButton}
        onClick={() => setShowCSVImport(!showCSVImport)}
      >
        {showCSVImport ? 'Cancel Import' : 'Show Import'}
      </button>
      {showCSVImport && (
        <CSVImportForm
          onClose={() => setShowCSVImport(false)}
          onSuccess={handleCSVImportSuccess}
        />
      )}
      <div style={styles.section}>
        {hasPlaidConnection ? (
          <>
            <h2 style={styles.subtitle}>Connected Accounts</h2>
            <div style={styles.accountsList}>
              {connectedAccounts.map((account, index) => (
                <div key={`${account.id}-${index}`} style={styles.accountItem}>
                  <strong>{account.name}</strong>
                  <span>•••• {account.mask}</span>
                  <span>{account.subtype}</span>
                </div>
              ))}
            </div>
            <div style={styles.buttonGroup}>
              <button
                onClick={() => open()}
                style={styles.reconnectButton}
                disabled={!linkToken || !ready}
              >
                Connect Account(s)
              </button>
              <button
                onClick={handleDisconnect}
                style={styles.disconnectButton}
                disabled={isLoading}
              >
                {isLoading ? 'Disconnecting...' : 'Disconnect Accounts'}
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 style={styles.subtitle}>Connect Bank Account</h2>
            <div style={styles.buttonGroup}>
              <button
                style={styles.plaidButton}
                onClick={() => open()}
                disabled={!linkToken || !ready}
              >
                Connect a bank account
              </button>
            </div>
          </>
        )}
      </div>
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
  searchContainer: {
    marginBottom: '20px',
  },
  searchInput: {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '16px',
    width: '100%',
    marginTop: '5px',
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
  importButton: {
    backgroundColor: '#0066cc',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    marginBottom: '16px',
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
    padding: '12px 24px 12px 24px',
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
  accountsList: {
    marginBottom: '20px',
  },
  accountItem: {
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '4px',
    marginBottom: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  reconnectButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  buttonGroup: {
    display: 'flex',
    // justifyContent: 'space-between',
    gap: '10px',
    marginTop: '16px',
    marginBottom: '16px',
  },
  disconnectButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  loaderStyle: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    fontSize: '18px',
    zIndex: 1000,
  },
};
