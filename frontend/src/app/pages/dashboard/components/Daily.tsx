import Card from '../../../components/Card';

const Daily = () => {
  return (
    <Card>
      <h4 style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem' }}>
        Spending Today
      </h4>
      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: '4px 0', textAlign: 'center' }}>
        $223.99
      </p>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        On average, you spend <span style={{ color: 'var(--negative)', fontWeight: '600' }}>$23</span> per day
      </p>
    </Card>
  );
};

export default Daily;
