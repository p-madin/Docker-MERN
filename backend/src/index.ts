// server/src/index.ts
import express, { Express, Request, Response, NextFunction } from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import { Collection, MongoClient, Document, ObjectId } from 'mongodb';
import session from 'express-session';
import MongoStore from 'connect-mongo';


const app: Express = express();

// Configure session with MongoDB store to persist sessions across server restarts
app.use(session({
  secret: 'my_secret',
  resave: false,
  saveUninitialized: false, // Don't create session until something stored
  store: MongoStore.create({
    mongoUrl: 'mongodb://app_user:app_password@172.19.0.2:27017/stackDB',
    collectionName: 'sessions',
    ttl: 24 * 60 * 60 // Session TTL (time to live) in seconds - 1 day
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 day in milliseconds
  }
}));

const port = 5000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//restart
async function connectToMongo() {
  const uri = 'mongodb://app_user:app_password@172.19.0.2:27017/stackDB';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

interface appUsers {
  _id: ObjectId;
  name: string;
  age: number;
  city: string;
  username: string;
}

class appUser implements appUsers {
  _id!: ObjectId;
  name: string = "";
  age: number = 0;
  city: string = "";
  username: string = "";
}

async function getDocumentCount<T extends Document>(
  collection: Collection<T>,
  query: object
): Promise<number> {
  try {
    const count = await collection.countDocuments(query);
    return count;
  } catch (error) {
    console.error('Error getting document count:', error);
    throw error;
  }
}

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
app.get('/', (req: Request, res: Response) => {
  res.send('Backend is running!');
});

// API endpoint
app.get('/api/greeting', (req: Request, res: Response) => {
  console.log(req.session);
  res.json({ message: 'Hello from the server!' });
});

// Session check endpoint
app.get('/api/session', (req: Request, res: Response) => {
  if (req.session.user) {
    res.json({
      loggedIn: true,
      user: {
        id: req.session.user.id,
        username: req.session.user.username
      }
    });
  } else {
    res.json({ loggedIn: false });
  }
});

app.get('/api/something', (req: Request, res: Response) => {
  res.json({ message: 'Hello from the server!' });
});

app.get('/api/getUsers', async (req: Request, res: Response) => {
  var this_cli = await connectToMongo();
  const db = this_cli.db('stackDB');
  const collection = db.collection<appUsers>('appUsers');
  const cursor = await collection.find();
  var output = "<ul>";
  var returned = new Array();
  await cursor.forEach((doc: appUsers) => {
    var local = new appUser();
    local.name = doc.name;
    local._id = doc._id;
    returned.push(local);
  });
  res.json({ users: returned });
});


app.post('/api/submit-form', async (req: Request, res: Response) => {
  const formData = req.body; // Data from the form
  console.log('Received form data:', formData);

  // Perform server-side validation, database operations, etc.
  if (!formData.username || !formData.password) {
    return res.status(400).json({ message: 'Name and email are required.' });
  }

  var this_cli = await connectToMongo();
  const db = this_cli.db('stackDB');
  const collection = db.collection<appUsers>('appUsers');

  // Find the user with matching credentials
  const user = await collection.findOne({ username: formData.username, password: formData.password });

  let message_output = "";

  if (user) {
    message_output = "Login successful";
    // Set the session with the actual user's id and username
    req.session.user = { id: user._id.toString(), username: user.username };
  } else {
    message_output = "Login unsuccessful";
  }

  // Simulate a successful response
  res.status(200).json({ message: message_output, data: formData });
});

app.post('/api/register-form', async (req: Request, res: Response) => {
  const formData = req.body; // Data from the form
  console.log('Received form data:', formData);

  // Perform server-side validation, database operations, etc.
  if (!formData.username || !formData.password) {
    return res.status(400).json({ message: 'Name and email are required.' });
  }
  var this_cli = await connectToMongo();
  const db = this_cli.db('stackDB');
  const collection = db.collection<appUsers>('appUsers');
  const result = await collection.insertOne(formData);
  console.log(`A document was inserted with the _id: ${result.insertedId}`);

  res.status(200).json({ message: 'User added' });
  console.log("register occurred");
});

// Logout endpoint
app.post('/api/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to logout' });
    }
    res.status(200).json({ message: 'Logout successful' });
  });
});

// For any other route, serve the React app's main index.html file.
// This is crucial for handling client-side routing.
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});