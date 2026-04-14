"use client";

import React, { useState } from 'react';
import { Form, Field, Button } from 'shadcn/form';
import { useRouter } from 'next/router';
import supabase from '../supabase';

const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await supabase.auth.signUp({
        email,
        password,
      });
      console.log('User is registered');
      router.push('/login');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Field type="email" label="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
      <Field type="password" label="Password" value={password} onChange={(event) => setPassword(event.target.value)} />
      <Button type="submit">Register</Button>
    </Form>
  );
};

export default RegisterForm;