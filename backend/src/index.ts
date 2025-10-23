// server/src/index.ts
import express, { Express, Request, Response, NextFunction } from 'express';
import path from 'path';

const app: Express = express();
const port = 5000;

// Custom logging middleware using console.log
const customLogger = (req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} request to ${req.originalUrl}`);
  next(); // Pass control to the next middleware or route handler
};

app.use(customLogger);

// Serve the client's production build as static files
app.use(express.static(path.join(__dirname, '../../client/dist')));

// Add a route handler for the root URL
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// API endpoint
app.get('/api/greeting', (req, res) => {
  res.json({ message: 'Hello from the server!' });
});

// For any other route, serve the React app's main index.html file.
// This is crucial for handling client-side routing.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});