type GreetingProps = {
  userName: string;
};

export default function Greeting({ userName }: GreetingProps) {
  return (
    <div>
      <h2>Welcome back, {userName}!</h2>
      <p>date</p>
    </div>
  );
}
