"use client";

import React, { useState } from 'react';
import { Form, Field, Button } from 'shadcn/form';
import { useRouter } from 'next/router';
import supabase from '../supabase';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const { user, session } = await supabase.auth.signIn({
        email,
        password,
      });
      if (session) {
        // User is signed in
        console.log('User is signed in');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Field type="email" label="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
      <Field type="password" label="Password" value={password} onChange={(event) => setPassword(event.target.value)} />
      <Button type="submit">Login</Button>
    </Form>
  );
};

export default LoginForm;