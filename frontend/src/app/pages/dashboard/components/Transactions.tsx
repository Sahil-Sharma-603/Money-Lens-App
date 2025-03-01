import styles from '../../../assets/page.module.css';

interface Transaction {
  amount: number;
  name: string;
  category: string;
}

interface TransactionsProps {
  transactions: Transaction[];
}

const Transactions = ({ transactions }: TransactionsProps) => {
  return (
    <div className={styles.card}>
      <h3 className={styles.transactionsTitle}>Recent Transactions</h3>
      {transactions.length === 0 ? (
        <p className={styles.emptyMessage}>No recent transactions.</p>
      ) : (
        <ul className={styles.transactionList}>
          {transactions.map((t, idx) => (
            <li key={idx} className={styles.transactionItem}>
              <span 
                className={styles.transactionAmount} 
                style={{ color: t.amount > 0 ? 'var(--negative)' : 'var(--positive)' }}
              >
                {t.amount > 0 ? '↓' : '↑'} ${Math.abs(t.amount).toFixed(2)}
              </span>
              <span>{t.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Transactions;
