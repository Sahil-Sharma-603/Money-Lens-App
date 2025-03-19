'use client';
type GreetingProps = {
    userName: string;
    balance: number; 
  };
  

  // const [chartData, setChartData] = useState<CategorySpending[]>([]);

  export default function Greeting({ userName, balance}: GreetingProps) {
    // const today = new Date().toLocaleDateString('en-US', {
    //   weekday: 'long',
    //   year: 'numeric',
    //   month: 'long',
    //   day: 'numeric',
    // });
  
    return (
      <div>
        <h2>Hello {userName}</h2>
        <p>${-balance.toFixed(2)}</p>
      </div>
    );
  }