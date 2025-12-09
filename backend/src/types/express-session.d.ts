// src/types/express-session.d.ts
import 'express-session';


declare module 'express-session' {
  interface SessionData {
    //userId?: string; // Add your custom properties here
    user?: { id: string, username: string };
  }
}

// Add this line
export { };