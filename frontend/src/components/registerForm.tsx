    import React, { useState } from 'react';
    import { useNavigate } from 'react-router-dom';

    interface FormData {
        name: string;
        age: string;
        city: string;
        username: string;
        password: string;
        email: string;
    }

    const RegisterForm: React.FC = () => {
        const [formData, setFormData] = useState<FormData>({ name: '', age: '', city:'', username: '', password: '', email: '' });

        const handleRegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        };

        const navigate = useNavigate();

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            try {
                const response = await fetch('/api/register-form', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });
                const data = await response.json();
                console.log('Form submitted successfully:', data);
                if(data.message=="User added"){
                    navigate('/');
                }else{
                }
            } catch (error) {
                console.error('Error submitting form:', error);
            }
        };
        return (
            <form onSubmit={handleSubmit} style={{border:'dashed 1px black'}}>
                <fieldset>
                    <legend>Register form</legend>
                    <div>
                        <label htmlFor="name">Name:</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleRegChange} />
                    </div>
                    <div>
                        <label htmlFor="city">City:</label>
                        <input type="text" id="city" name="city" value={formData.city} onChange={handleRegChange} />
                    </div>
                    <div>
                        <label htmlFor="age">Age:</label>
                        <input type="text" id="age" name="age" value={formData.age} onChange={handleRegChange} />
                    </div>
                    <div>
                        <label htmlFor="username">Username:</label>
                        <input type="text" id="username" name="username" value={formData.username} onChange={handleRegChange} />
                    </div>
                    <div>
                        <label htmlFor="password">Password:</label>
                        <input type="password" id="password" name="password" value={formData.password} onChange={handleRegChange} />
                    </div>
                    <div>
                        <label htmlFor="password">Email:</label>
                        <input type="text" id="email" name="email" value={formData.email} onChange={handleRegChange} />
                    </div>
                    <button type="submit">Submit</button>
                </fieldset>
            </form>
        );
    };

    export default RegisterForm;