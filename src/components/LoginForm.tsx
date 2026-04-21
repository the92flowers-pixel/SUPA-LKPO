"use client";

import React from 'react';
import { Form, Field } from '@shadcn/ui';
import { supabaseClient } from '../supabase';

const LoginForm = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await supabaseClient.auth.signIn({
        email,
        password,
      });
      // After successful login, open the dashboard
      window.location.href = '/dashboard';
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
      <button type="submit">Login</button>
    </Form>
  );
};

export default LoginForm;