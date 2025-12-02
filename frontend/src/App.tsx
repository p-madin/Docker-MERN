import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NewRoutePage from './components/newRoute.tsx';
import Home from './components/home.tsx';
import Dashboard from './components/dashboard.tsx';

// Define a TypeScript interface for the data we expect from the API
interface GreetingData {
  message: string;
}

const App: React.FC = () => {

  return (
    <BrowserRouter>
      <Routes>
         <Route path="/" element={<Home />} />
         <Route path="/new-route" element={<NewRoutePage />} />
         <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;