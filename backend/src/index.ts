// server/src/index.ts
import express, { Express, Request, Response, NextFunction } from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import { Collection, MongoClient, Document, ObjectId } from 'mongodb';
import session from 'express-session';


const app: Express = express();

app.use(session({
    secret: 'my_secret',
    resave: false,
    saveUninitialized: true
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
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// API endpoint
app.get('/api/greeting', (req, res) => {
  res.json({ message: 'Hello from the server!'});
});
app.get('/api/something', (req, res) => {
  res.json({ message: 'Hello from the server!'});
});

app.get('/api/getUsers', async (req, res) => {
    console.log(req.session);
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
    //output = output + "<li>"+doc.name+"</li>\n";
  });
  //output = output + "</ul>";
  res.json({ users: returned});
});


app.post('/api/submit-form', async (req, res) => {
    const formData = req.body; // Data from the form
    console.log('Received form data:', formData);

    // Perform server-side validation, database operations, etc.
    if (!formData.username || !formData.password) {
        return res.status(400).json({ message: 'Name and email are required.' });
    }

    var this_cli = await connectToMongo();
    const db = this_cli.db('stackDB');
    const collection = db.collection<appUsers>('appUsers');
    const userCount = await getDocumentCount(collection, {username:formData.username,password:formData.password});
    //const cursor = await collection.find({username:formData.username,password:formData.password});
    console.log(userCount);

    let message_output = "";

    if(userCount==1){
        message_output = "Login successful";
        req.session.user = { id: 1, username: "john_doe" };
    }else{
        message_output = "Login unsuccessful";
    }

    // Simulate a successful response
    res.status(200).json({ message: message_output, data: formData });
});

app.post('/api/register-form', async (req, res) => {
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

    res.status(200).json({message:'User added'});
    console.log("register occurred");
});

// For any other route, serve the React app's main index.html file.
// This is crucial for handling client-side routing.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});