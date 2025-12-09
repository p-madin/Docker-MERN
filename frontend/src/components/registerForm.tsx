import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import XmlForm from './XmlForm.tsx';

interface FormData {
    name: string;
    age: string;
    city: string;
    username: string;
    password: string;
    email: string;
}

const RegisterForm: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({ name: '', age: '', city: '', username: '', password: '', email: '' });

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
            if (data.message == "User added") {
                navigate('/');
            } else {
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };
    return (
        <div id='registerFormComponent'>
            <fieldset>
                <legend>Register form</legend>
                <XmlForm
                    nameDependency="register"
                    onSubmit={handleSubmit}
                    rows={[
                        { label: "Name:", name: "name", type: "text", value: formData.name, onChange: handleRegChange },
                        { label: "City:", name: "city", type: "text", value: formData.city, onChange: handleRegChange },
                        { label: "Age:", name: "age", type: "text", value: formData.age, onChange: handleRegChange },
                        { label: "Username:", name: "username", type: "text", value: formData.username, onChange: handleRegChange },
                        { label: "Password:", name: "password", type: "password", value: formData.password, onChange: handleRegChange },
                        { label: "Email:", name: "email", type: "text", value: formData.email, onChange: handleRegChange },
                    ]}
                />
            </fieldset>
        </div>
    );
};

export default RegisterForm;