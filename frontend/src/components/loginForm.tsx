    import React, { useState } from 'react';
    import { useNavigate } from 'react-router-dom';

    interface FormData {
        username: string;
        password: string;
    }

    const LoginForm: React.FC = () => {
        const [formData, setFormData] = useState<FormData>({ username: '', password: '' });

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        };

        const navigate = useNavigate();

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
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
              if(data.message=="Login successful"){
                navigate('/dashboard');
              }else{
              }
            } catch (error) {
              console.error('Error submitting form:', error);
            }
        };

        return (
            <form onSubmit={handleSubmit} style={{border:'dashed 1px black'}}>
                <fieldset>
                    <legend>Login form</legend>
                    <div>
                        <label htmlFor="username">Username:</label>
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label htmlFor="password">Password:</label>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                        />
                    </div>
                    <button type="submit">Submit</button>
                </fieldset>
            </form>
        );
    };

    export default LoginForm;
