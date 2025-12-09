import React from 'react';
import LoginForm from '../components/loginForm.tsx';
import { useFetchGreeting } from '../components/fetcher.tsx';

const Dashboard: React.FC = () => {
  const { data, loading, error } = useFetchGreeting();
  return (
    <div className="App">
      <header className="App-header">
        <h1>React App with Express Backend</h1>
        {loading && <p>Loading data from server...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {data && <h2>{data.message}</h2>}
        <LoginForm />
      </header>
    </div>
  );
};

export default Dashboard;