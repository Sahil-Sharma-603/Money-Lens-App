import Card from '../../components/Card';
import styles from '../../assets/page.module.css';
import FullPageCard from './components/FullPageCard';
import Greeting from './components/Greeting';
import StatCard from './components/StatCard';
import Summary from './components/Summary';
import Transactions from './components/Transactions';
import BarChartComponent from './components/BarChartComponent';

export default function Dashboard() {
  return (
    <div className={styles.dashboard}>
      <Card className={styles.fullPageCard} 
      // Test
      />
    </div>
  );
}
