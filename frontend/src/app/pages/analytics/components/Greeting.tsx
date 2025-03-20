'use client';
type GreetingProps = {
    userName: string;
  };
  
  export default function Greeting({ userName}: GreetingProps) {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  
    return (
      <div>
        <h2>Analytics</h2>
        <p>{today}</p>
      </div>
    );
  }