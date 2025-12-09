import React from 'react';
import { useFetchUserData } from './fetcher.tsx';

const FetchList: React.FC = () => {
  // Use the custom hook for fetching user data
  const { userData, userLoading, userError } = useFetchUserData();

  return (
    <ul>
      {userLoading && <p>Loading users...</p>}
      {userError && <p style={{ color: 'red' }}>Error: {userError}</p>}
      {userData.map((doc) => (
        <li key={doc._id}>
          {doc.name}
        </li>
      ))}
    </ul>
  );
};

export default FetchList;