import React, {useState, useEffect} from 'react';
import LoginForm from './loginForm.tsx';
import RegisterForm from './registerForm.tsx';
import FetchList from './fetchList.tsx';


interface appUsers {
  name: string;
  age: number;
  city: string;
  username: string;
}

const Home: React.FC = () => {
  const [data, setData] = useState<GreetingData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/greeting');
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const result: GreetingData = await response.json();
        setData(result);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>React App with Express Backend</h1>
        {loading && <p>Loading data from server...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {data && <h2>{data.message}</h2>}
      </header>
      <FetchList />
      <LoginForm />
      <RegisterForm />
    </div>
  );
};

export default Home;