import Card from '../components/Card';
import styles from '../components/Card.module.css';

export default function Dashboard() {
  return (
    <div className={styles.dashboard}>
      <Card className={styles.fullPageCard} />
    </div>
  );
}