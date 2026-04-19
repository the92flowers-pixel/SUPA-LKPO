"use client";

import React from 'react';
import { Form, Field } from '@shadcn/ui';
import { supabaseClient } from '../supabase';

const RegistrationForm = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [username, setUsername] = React.useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await supabaseClient.auth.signUp({
        email,
        password,
        options: { username },
      });
      // After successful registration, automatically log in and open the dashboard
      const user = await supabaseClient.auth.getUser();
      window.location.href = `/dashboard/${user.id}`;
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Field
        label="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Field
        label="Password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <Field
        label="Username"
        type="text"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
      />
      <button type="submit">Register</button>
    </Form>
  );
};

export default RegistrationForm;