"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/index.ts
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const port = 3000;
// Custom logging middleware using console.log
const customLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - ${req.method} request to ${req.originalUrl}`);
    next(); // Pass control to the next middleware or route handler
};
app.use(customLogger);
// Serve the client's production build as static files
app.use(express_1.default.static(path_1.default.join(__dirname, '../../client/dist')));
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
    res.sendFile(path_1.default.join(__dirname, '../../client/dist/index.html'));
});
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
});
