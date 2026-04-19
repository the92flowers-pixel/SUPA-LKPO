"use client";

import React from 'react';
import { Form, Field } from '@shadcn/ui';
import { supabaseClient } from '../supabase';

const ReleaseForm = () => {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [image, setImage] = React.useState(null);
  const [streams, setStreams] = React.useState([]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await supabaseClient.auth.signUp({
        email: 'admin@example.com',
        password: 'password123',
        options: { username: 'admin' },
      });
      // Create a new release
      const release = await supabaseClient.from('releases').insert([
        {
          title,
          description,
          image,
          streams,
        },
      ]);
      // Get the artist's ID from the user's data
      const artistId = await supabaseClient.from('artists').select('id').eq('username', 'artist');
      // Create a new release for the artist
      const artistRelease = await supabaseClient.from('releases').insert([
        {
          title: `${release[0].title} - ${artistId[0].id}`,
          description,
          image: release[0].image,
          streams: [...release[0].streams, ...artistStreams],
        },
      ]);
      // Update the artist's data with the new release
      await supabaseClient.from('artists').update(artistId[0].id, {
        releases: [artistRelease[0].id],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Field
        label="Title"
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <Field
        label="Description"
        type="textarea"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <Field
        label="Image"
        type="file"
        value={image}
        onChange={handleImageChange}
      />
      <Field
        label="Streams"
        type="text"
        value={streams.join(', ')}
        onChange={(event) => setStreams(event.target.value.split(','))}
      />
      <button type="submit">Create Release</button>
    </Form>
  );
};

export default ReleaseForm;