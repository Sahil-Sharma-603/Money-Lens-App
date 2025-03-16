'use client';

import {
  Account,
  AccountsResponse,
  apiRequest,
  PlaidLinkResponse,
} from '@/app/assets/utilities/API_HANDLER';
import CSVImportForm from '@/app/components/file-import/CSVImportForm';
import { Building, Plus, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';

export default function Home() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);

  // We'll now use our own Account type instead of PlaidAccount
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [hasPlaidConnection, setHasPlaidConnection] = useState(false);

  // Account creation/editing state
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'checking',
    balance: 0,
    currency: 'USD',
    institution: '',
  });

  // Delete confirmation
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

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
    // Only fetch accounts if the user is authenticated
    if (!isCheckingAuth) {
      fetchAccounts();
    }
  }, [isCheckingAuth]);

  // Function to fetch all accounts
  const fetchAccounts = async () => {
    try {
      const data = await apiRequest<AccountsResponse>('/accounts');
      setAccounts(data.accounts);

      // Check if any plaid accounts exist
      const plaidAccounts = data.accounts.filter(
        (account) => account.type === 'plaid'
      );
      setHasPlaidConnection(plaidAccounts.length > 0);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setAccounts([]);
      setHasPlaidConnection(false);
    }
  };

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

  // Function to fetch historical transactions (up to 24 months)
  const fetchHistoricalTransactions = async () => {
    try {
      setIsLoading(true);

      const data = await apiRequest('/plaid/transactions/historical', {
        method: 'GET',
      });

      console.log('Historical transactions fetch completed:', data);

      // Show success message
      alert(
        `Successfully processed ${data.total_transactions} historical transactions. Check your transactions page.`
      );

      // Refresh accounts after processing
      fetchAccounts();
    } catch (error) {
      console.error('Error fetching historical transactions:', error);
      alert('Error fetching historical transactions. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your bank account?')) {
      return;
    }

    setIsLoading(true);
    try {
      // 1. Disconnect from Plaid
      await apiRequest('/plaid/disconnect', {
        method: 'POST',
      });

      // 2. Delete all plaid accounts from the database
      await apiRequest('/accounts/plaid', {
        method: 'DELETE',
      });

      // 3. Refresh accounts list
      await fetchAccounts();

      alert(
        'Bank account disconnected and plaid accounts deleted successfully'
      );
    } catch (error) {
      console.error('Error disconnecting account:', error);
      alert('Failed to disconnect bank account');
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

      // Fetch and update all accounts immediately
      try {
        await fetchAccounts();
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
    fetchAccounts();
  };

  // Handle creating a new account
  const handleCreateAccount = async () => {
    setIsLoading(true);
    try {
      await apiRequest('/accounts', {
        method: 'POST',
        body: newAccount,
      });

      // Reset form and close modal
      setNewAccount({
        name: '',
        type: 'checking',
        balance: 0,
        currency: 'USD',
        institution: '',
      });
      setShowCreateAccountModal(false);

      // Refresh accounts list
      await fetchAccounts();

      alert('Account created successfully');
    } catch (error) {
      console.error('Error creating account:', error);
      alert('Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle account deletion and transaction cleanup
  const handleDeleteAccount = async () => {
    if (!accountToDelete) return;

    setIsLoading(true);
    try {
      await apiRequest(`/accounts/${accountToDelete._id}`, {
        method: 'DELETE',
      });

      // Close confirmation modal
      setShowDeleteConfirmation(false);
      setAccountToDelete(null);

      // Refresh accounts list
      await fetchAccounts();

      alert('Account and associated transactions deleted successfully');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    } finally {
      setIsLoading(false);
    }
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
          Getting your transactions (this might take long), please wait...
        </div>
      )}
      <h1 style={styles.title}>Bank Account Connection</h1>
      <button
        style={styles.importButton}
        onClick={() => setShowCSVImport(!showCSVImport)}
      >
        {showCSVImport ? 'Cancel Import' : 'Show CSV Import'}
      </button>
      {showCSVImport && (
        <CSVImportForm
          onClose={() => setShowCSVImport(false)}
          onSuccess={handleCSVImportSuccess}
        />
      )}
      {/* Accounts Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.subtitle}>Your Accounts</h2>
          <div style={styles.headerButtons}>
            <button
              onClick={() => setShowCreateAccountModal(true)}
              style={styles.plaidButton}
            >
              <Plus size={16} style={{ marginRight: '8px' }} />
              Create Account
            </button>
            <button
              onClick={() => open()}
              style={styles.plaidButton}
              disabled={!linkToken || !ready || isLoading}
            >
              <Building size={16} style={{ marginRight: '8px' }} />
              Connect Bank
            </button>
          </div>
        </div>

        {accounts.length === 0 ? (
          <div style={styles.emptyState}>
            <p>
              You don't have any accounts yet. Create a manual account or
              connect to your bank.
            </p>
          </div>
        ) : (
          <>
            {/* Manual Accounts */}
            <div style={styles.accountsSection}>
              <h3 style={styles.accountsSubtitle}>Manual Accounts</h3>
              <div style={styles.accountsList}>
                {accounts
                  .filter((account) => account.type !== 'plaid')
                  .map((account) => (
                    <div key={account._id} style={styles.accountItem}>
                      <div style={styles.accountInfo}>
                        <strong>{account.name}</strong>
                        <span style={styles.accountType}>{account.type}</span>
                      </div>
                      <div style={styles.accountBalance}>
                        {account.currency} {account.balance.toFixed(2)}
                      </div>
                      <div style={styles.accountActions}>
                        <button
                          onClick={() => {
                            setAccountToDelete(account);
                            setShowDeleteConfirmation(true);
                          }}
                          style={styles.deleteButton}
                          disabled={isLoading}
                        >
                          <Trash size={16} style={{ marginRight: '4px' }} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}

                {accounts.filter((account) => account.type !== 'plaid')
                  .length === 0 && (
                  <div style={styles.emptyAccountsMessage}>
                    No manual accounts yet. Create one to get started.
                  </div>
                )}
              </div>
            </div>

            {/* Plaid Accounts */}
            <div style={styles.accountsSection}>
              <h3 style={styles.accountsSubtitle}>Connected Bank Accounts</h3>
              <div style={styles.accountsList}>
                {accounts
                  .filter((account) => account.type === 'plaid')
                  .map((account) => (
                    <div key={account._id} style={styles.accountItem}>
                      <div style={styles.accountInfo}>
                        <strong>{account.name}</strong>
                        {account.plaid_mask && (
                          <span style={styles.accountNumber}>
                            •••• {account.plaid_mask}
                          </span>
                        )}
                        {account.plaid_subtype && (
                          <span style={styles.accountType}>
                            {account.plaid_subtype}
                          </span>
                        )}
                      </div>
                      <div style={styles.accountBalance}>
                        {account.currency} {account.balance.toFixed(2)}
                      </div>
                      <div style={styles.accountInstitution}>
                        {account.institution}
                      </div>
                    </div>
                  ))}

                {accounts.filter((account) => account.type === 'plaid')
                  .length === 0 && (
                  <div style={styles.emptyAccountsMessage}>
                    No bank accounts connected. Use the "Connect Bank" button to
                    link your accounts.
                  </div>
                )}
              </div>

              {hasPlaidConnection && (
                <div style={styles.buttonGroup}>
                  <button
                    onClick={handleDisconnect}
                    style={styles.disconnectButton}
                    disabled={isLoading}
                  >
                    {isLoading
                      ? 'Processing...'
                      : 'Disconnect All Bank Accounts'}
                  </button>

                  <button
                    onClick={fetchHistoricalTransactions}
                    style={{
                      ...styles.plaidButton,
                      marginLeft: '10px',
                      backgroundColor: '#4285F4',
                    }}
                    disabled={isLoading}
                  >
                    {isLoading
                      ? 'Processing...'
                      : 'Fetch Historical Transactions (24 Months)'}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Create Account Modal */}
      {showCreateAccountModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>Create a New Account</h3>

            <div style={styles.formGroup}>
              <label style={styles.label}>Account Name:</label>
              <input
                type="text"
                value={newAccount.name}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, name: e.target.value })
                }
                style={styles.input}
                placeholder="e.g., My Checking Account"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Account Type:</label>
              <select
                value={newAccount.type}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, type: e.target.value })
                }
                style={styles.input}
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
                <option value="credit">Credit Card</option>
                <option value="loan">Loan</option>
                <option value="investment">Investment</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Starting Balance:</label>
              <input
                type="number"
                step="0.01"
                value={newAccount.balance}
                onChange={(e) =>
                  setNewAccount({
                    ...newAccount,
                    balance: parseFloat(e.target.value),
                  })
                }
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Currency:</label>
              <select
                value={newAccount.currency}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, currency: e.target.value })
                }
                style={styles.input}
              >
                <option value="USD">USD - US Dollar</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="AUD">AUD - Australian Dollar</option>
                <option value="JPY">JPY - Japanese Yen</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Institution (optional):</label>
              <input
                type="text"
                value={newAccount.institution}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, institution: e.target.value })
                }
                style={styles.input}
                placeholder="e.g., Chase, Bank of America"
              />
            </div>

            <div style={styles.modalButtons}>
              <button
                onClick={() => setShowCreateAccountModal(false)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAccount}
                style={styles.saveButton}
                disabled={isLoading || !newAccount.name}
              >
                {isLoading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && accountToDelete && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>Confirm Account Deletion</h3>

            <p style={styles.warningText}>
              Are you sure you want to delete the account "
              {accountToDelete.name}"?
            </p>
            <p style={styles.warningText}>
              All transactions associated with this account will also be
              deleted. This action cannot be undone.
            </p>

            <div style={styles.modalButtons}>
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setAccountToDelete(null);
                }}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                style={styles.deleteConfirmButton}
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '40px',
    maxWidth: '900px',
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
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
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
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  headerButtons: {
    display: 'flex',
    gap: '10px',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  accountsSection: {
    marginBottom: '30px',
  },
  accountsSubtitle: {
    fontSize: '18px',
    marginBottom: '10px',
    color: '#444',
    borderBottom: '1px solid #ddd',
    paddingBottom: '8px',
  },
  accountInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    flex: '1',
  },
  accountType: {
    color: '#666',
    fontSize: '14px',
    textTransform: 'capitalize' as const,
  },
  accountNumber: {
    color: '#666',
    fontSize: '14px',
  },
  accountBalance: {
    fontWeight: 'bold' as const,
    minWidth: '120px',
    textAlign: 'right' as const,
  },
  accountInstitution: {
    color: '#666',
    fontSize: '14px',
    minWidth: '100px',
    textAlign: 'right' as const,
  },
  accountActions: {
    display: 'flex',
    gap: '5px',
    minWidth: '80px',
    justifyContent: 'flex-end',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '30px',
    color: '#666',
  },
  emptyAccountsMessage: {
    padding: '15px',
    color: '#666',
    textAlign: 'center' as const,
    fontStyle: 'italic',
  },
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    maxWidth: '500px',
    width: '100%',
  },
  formGroup: {
    marginBottom: '20px',
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '30px',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    color: '#333',
    padding: '8px 16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  deleteConfirmButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  warningText: {
    color: '#dc3545',
    fontWeight: 'bold' as const,
    marginBottom: '10px',
  },
};
