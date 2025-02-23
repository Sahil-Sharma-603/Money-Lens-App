import Link from 'next/link';
import Card from '../../components/Card';
import styles from '../../components/Card.module.css';

export default function Dashboard() {
  return (
    <div className={styles.dashboard}>
      <Card className={styles.fullPageCard} />
      <Link className="btn" href="/pages/plaid-setup">
        Go to Plaid Setup
      </Link>
    </div>
  );
}
