import Card from '../../../components/Card';

const Summary = () => {
    return (
      <Card>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
            This month you have earned <span style={{ color: 'var(--positive)', fontWeight: '600' }}>$2234</span> and spent{' '}
            <span style={{ color: 'var(--negative)', fontWeight: '600' }}>$322</span>.
        </p>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '6px' }}>
            On average, you earn <span style={{ color: 'var(--positive)', fontWeight: '600' }}>$2288</span> and spend{' '}
            <span style={{ color: 'var(--negative)', fontWeight: '600' }}>$702</span> per month.
        </p>
      </Card>
    );
  };
  
  export default Summary;
  