import Card from '../../../components/Card';

type SummaryProps = { 
  thisMonth: { spent: number; earned: number };
  monthAvg: { spent: number; earned: number };
};

export default function Summary({ thisMonth, monthAvg }: SummaryProps) {
  return (
    <Card>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
          This month you have earned <span style={{ color: 'var(--positive)', fontWeight: '600' }}>${Math.abs(thisMonth.earned).toFixed(2)}</span> and spent{' '}
          <span style={{ color: 'var(--negative)', fontWeight: '600' }}>${thisMonth.spent.toFixed(2)}</span>.
      </p>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '6px' }}>
          On average, you earn <span style={{ color: 'var(--positive)', fontWeight: '600' }}>${Math.abs(monthAvg.earned).toFixed(2)}</span> and spend{' '}
          <span style={{ color: 'var(--negative)', fontWeight: '600' }}>${monthAvg.spent.toFixed(2)}</span> per month.
      </p>
    </Card>
  );
}
