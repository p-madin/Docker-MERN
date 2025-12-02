import React, {useState, useEffect} from 'react';

interface appUsers {
  _id: string;
  name: string;
  age: number;
  city: string;
  username: string;
}

const FetchList: React.FC = () => {
  const [UserData, setUserData] = useState<UserData[]>([]);
  const [userLoading, setUserLoading] = useState<boolean>(true);
  const [userError, setUserError] = useState<string | null>(null);
  useEffect(() => {
    // Fetch data from the Express backend when the component mounts
    const fetchUserData = async () => {
      try {
        // Use the relative path to the API endpoint.
        // In the Docker Compose setup, the React dev server will proxy this
        // request to the Express server. In production, the Express server serves
        // the client and handles the API route.
        const response = await fetch('/api/getUsers');
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const result: UserData = await response.json();
        console.log(result);
        setUserData(result.users);
      } catch (e: any) {
        setUserError(e.message);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUserData();
  }, []); // The empty dependency array ensures this runs only once on mount

  return (
        <ul>
        {UserData.map((doc)=>(
            <li key={doc._id}>
                {doc.name}
            </li>
        ))}

        </ul>
  );
};

export default FetchList;