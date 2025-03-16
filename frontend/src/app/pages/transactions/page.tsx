'use client';

import { useEffect, useState } from 'react';
import styles from '../../assets/page.module.css';
import {
  apiRequest,
  type Transaction,
  TransactionsResponse,
} from '../../assets/utilities/API_HANDLER';
import Card from '../../components/Card';

export default function Transaction() {
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>(''); // Added search state
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Edit mode state
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editValues, setEditValues] = useState({
    name: '',
    amount: 0,
    category: '',
    date: ''
  });

  useEffect(() => {
    fetchStoredTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  
  // Handle edit button click
  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditValues({
      name: transaction.name,
      amount: transaction.amount,
      category: transaction.category.join(', '),
      date: transaction.date
    });
  };
  
  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editingTransaction) return;
    
    try {
      setIsLoading(true);
      
      // Prepare the updated data
      const updatedData = {
        name: editValues.name,
        amount: parseFloat(editValues.amount.toString()),
        category: editValues.category.split(',').map(cat => cat.trim()),
        date: editValues.date
      };
      
      // Call the API to update the transaction
      await apiRequest(
        `/transactions/${editingTransaction._id}`,
        {
          method: 'PUT',
          body: updatedData
        }
      );
      
      // Refresh the transactions list
      await fetchStoredTransactions();
      
      // Reset editing state
      setEditingTransaction(null);
      
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Failed to update transaction');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle delete transaction
  const handleDeleteTransaction = async (id: string) => {
    // Confirm before deleting
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Call the API to delete the transaction
      await apiRequest(
        `/transactions/${id}`,
        {
          method: 'DELETE'
        }
      );
      
      // Refresh the transactions list
      await fetchStoredTransactions();
      
      alert('Transaction deleted successfully');
      
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.dashboard}>
      <Card className={styles.fullPageCard}>
        <h2>Transactions</h2>

        {/* Search input */}
        <div style={style.container}>
          <div style={style.searchContainer}>
            <label style={style.label}>Search Transactions:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or merchant"
              style={style.searchInput}
            />
          </div>

          <div style={style.datePickerContainer}>
            <div style={style.datePickerGroup}>
              <label style={style.label}>From Date:</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={style.input}
              />
            </div>
            <div style={style.datePickerGroup}>
              <label style={style.label}>To Date:</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={style.input}
              />
            </div>
          </div>
          <button
            onClick={fetchStoredTransactions}
            disabled={isLoading}
            style={style.fetchButton}
          >
            {isLoading ? 'Loading...' : 'Get Transactions'}
          </button>
        </div>

        {transactions.length > 0 && (
          <div style={style.tableContainer}>
            <table style={style.table}>
              <thead>
                <tr>
                  <th style={style.th}>Date</th>
                  <th style={style.th}>Name</th>
                  <th style={style.th}>Amount</th>
                  <th style={style.th}>Category</th>
                  <th style={style.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.transaction_id}>
                    <td style={style.td}>{transaction.date}</td>
                    <td style={style.td}>{transaction.name}</td>
                    <td style={style.td}>
                      <span
                        style={
                          transaction.amount < 0
                            ? style.positive
                            : style.negative
                        }
                      >
                        ${Math.abs(transaction.amount).toFixed(2)}
                      </span>
                    </td>
                    <td style={style.td}>{transaction.category.join(', ')}</td>
                    <td style={style.td}>
                      <div style={style.actionButtonsContainer}>
                        <button
                          onClick={() => handleEditClick(transaction)}
                          style={style.editButton}
                          disabled={isLoading}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(transaction._id)}
                          style={style.deleteButton}
                          disabled={isLoading}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit Transaction Modal */}
        {editingTransaction && (
          <div style={style.modalOverlay}>
            <div style={style.modalContent}>
              <h3>Edit Transaction</h3>
              
              <div style={style.formGroup}>
                <label style={style.label}>Date:</label>
                <input
                  type="date"
                  value={editValues.date}
                  onChange={(e) => setEditValues({...editValues, date: e.target.value})}
                  style={style.input}
                />
              </div>
              
              <div style={style.formGroup}>
                <label style={style.label}>Name:</label>
                <input
                  type="text"
                  value={editValues.name}
                  onChange={(e) => setEditValues({...editValues, name: e.target.value})}
                  style={style.input}
                />
              </div>
              
              <div style={style.formGroup}>
                <label style={style.label}>Amount:</label>
                <input
                  type="number"
                  step="0.01"
                  value={editValues.amount}
                  onChange={(e) => setEditValues({...editValues, amount: parseFloat(e.target.value)})}
                  style={style.input}
                />
              </div>
              
              <div style={style.formGroup}>
                <label style={style.label}>Category (comma-separated):</label>
                <input
                  type="text"
                  value={editValues.category}
                  onChange={(e) => setEditValues({...editValues, category: e.target.value})}
                  style={style.input}
                />
              </div>
              
              <div style={style.modalButtonGroup}>
                <button 
                  onClick={() => setEditingTransaction(null)} 
                  style={style.cancelButton}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveEdit} 
                  style={style.saveButton}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

const style = {
  container: {
    padding: '40px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  actionButtonsContainer: {
    display: 'flex',
    gap: '5px',
  },
  editButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '14px',
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
    padding: '20px',
    borderRadius: '5px',
    minWidth: '300px',
    maxWidth: '500px',
    width: '100%',
  },
  formGroup: {
    marginBottom: '15px',
  },
  modalButtonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    color: '#333',
    padding: '8px 16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
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
    marginTop: '16px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '16px',
  },
  disconnectButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '0px 24px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#dc3545',
  },
};
