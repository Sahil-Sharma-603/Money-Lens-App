import Card from '../../../components/Card';

// Balance is hardcoded until we figure out a way to import it or calculate it ourselves..
const Balance = () => {
  return (
    <Card>
      <h4 style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem' }}>
        Account Balance
      </h4>
      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: '4px 0', textAlign: 'center' }}>
        $22,133.00
      </p>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        <span style={{ color: 'var(--negative)', fontWeight: '600' }}>-3.4%</span> compared to last week
      </p>
    </Card>
  );
};

export default Balance;
