import React, {useState, useEffect} from 'react';

// Define a TypeScript interface for the data we expect from the API
interface GreetingData {
  message: string;
}

const App: React.FC = () => {
  const [data, setData] = useState<GreetingData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch data from the Express backend when the component mounts
    const fetchData = async () => {
      try {
        // Use the relative path to the API endpoint.
        // In the Docker Compose setup, the React dev server will proxy this
        // request to the Express server. In production, the Express server serves
        // the client and handles the API route.
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
  }, []); // The empty dependency array ensures this runs only once on mount

  return (
    <div className="App">
      <header className="App-header">
        <h1>React App with Express Backend</h1>
        {loading && <p>Loading data from server...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {data && <h2>{data.message}</h2>}
      </header>
    </div>
  );
};

export default App;