import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from './fetcher.tsx';
import XmlForm from './XmlForm.tsx';

interface FormData {
  username: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({ username: '', password: '' });
  const { loggedIn, user, loading, refreshSession } = useSession();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loggedIn) {
      await handleLogout();
      return;
    }

    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      console.log('Form submitted successfully:', data);
      if (data.message == "Login successful") {
        await refreshSession(); // Wait for session state to refresh
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log('Logout successful:', data);
      await refreshSession(); // Refresh session state after logout
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return <div style={{ border: 'dashed 1px black', padding: '10px' }}>Loading session...</div>;
  }

  return (
    <div id='loginFormComponent' >
      {loggedIn && user ? (
        // Logged in view
        <fieldset>
          <legend>User Session</legend>

          <div className='flex-row'>
            <div className='flex-cell'>
              Welcome
            </div>
            <div className='flex-cell'>
              {user.username}
            </div>
          </div>
          <div className='flex-row'>
            <div className='flex-cell'>
              User ID
            </div>
            <div className='flex-cell'>
              {user.id}
            </div>
          </div>
          <div className='flex-row'>
            <div className='flex-cell'></div>
            <div className='flex-cell'>
              <input type="submit" value="Logout" onClick={() => handleLogout()} />
            </div>
          </div>
        </fieldset>
      ) : (
        // Logged out view - show login form
        <fieldset>
          <legend>Login form</legend>
          <XmlForm
            nameDependency="login"
            onSubmit={handleSubmit}
            rows={[
              {
                label: "Username:",
                name: "username",
                type: "text",
                value: formData.username,
                onChange: handleChange
              },
              {
                label: "Password:",
                name: "password",
                type: "password",
                value: formData.password,
                onChange: handleChange
              }
            ]}
          />
        </fieldset>
      )
      }
    </div >
  );
};

export default LoginForm;
