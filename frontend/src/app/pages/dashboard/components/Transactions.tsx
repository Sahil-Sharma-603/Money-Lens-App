import styles from '../../../assets/page.module.css';
const transactions = [
    { amount: -34.99, label: 'Indigo Books' },
    { amount: 333.0, label: 'E-Transfer' },
    { amount: -1.99, label: '7/11' },
    { amount: -233.99, label: 'Best Buy' },
    { amount: 1342.99, label: 'Job' },
  ];
  
  const Transactions = () => {
    return (
        <div className={styles.card}>
            <h3 className={styles.transactionsTitle}>Recent Transactions</h3>
            <ul className={styles.transactionList}>
                {transactions.map((t, idx) => (
                <li key={idx} className={styles.transactionItem}>
                    <span className={t.amount < 0 ? styles.expense : styles.income}>
                    {t.amount < 0 ? '↓' : '↑'} ${Math.abs(t.amount).toFixed(2)}
                    </span>
                    <span>{t.label}</span>
                </li>
                ))}
            </ul>
          </div>
    );
  };
  
  export default Transactions;
  