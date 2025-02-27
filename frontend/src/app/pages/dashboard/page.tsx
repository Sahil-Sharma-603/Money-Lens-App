import Card from '../../components/Card';
import styles from '../../assets/page.module.css';
import Greeting from './components/Greeting';
import Daily from './components/Daily';
import Balance from './components/Balance';
import Summary from './components/Summary';
import Transactions from './components/Transactions';
import BarChartComponent from './components/BarChartComponent';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className={styles.dashboard}>
      <Card className={styles.fullPageCard}>

      <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          <Greeting />

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: '1' }}>
              <Daily />
            </div>
            <div style={{ flex: '1' }}>
              <Balance />
            </div>
          </div>

          <Summary />

          <BarChartComponent />
        </div>

        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', marginLeft: 10 }}>
          <Transactions />
          {/* This should be moved elsewhere */}
          <Link className="btn" href="/pages/plaid-setup">
            Go to Plaid Setup
          </Link>
        </div>
      </Card>
    </div>
  );
}
