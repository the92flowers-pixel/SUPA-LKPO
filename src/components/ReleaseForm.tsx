"use client";

import React from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

const ReleaseForm = () => {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [image, setImage] = React.useState<File | null>(null);
  const [streams, setStreams] = React.useState<string[]>([]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      await supabase.from('releases').insert([
        {
          title,
          description,
          user_id: userData.user.id,
          streams: streams.length,
        },
      ]);
      window.location.href = '/releases';
    } catch (error) {
      console.error(error);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setImage(event.target.files[0]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Image</Label>
        <Input
          type="file"
          onChange={handleImageChange}
        />
      </div>
      <div className="space-y-2">
        <Label>Streams (comma separated)</Label>
        <Input
          type="text"
          value={streams.join(', ')}
          onChange={(event) => setStreams(event.target.value.split(','))}
        />
      </div>
      <Button type="submit">Create Release</Button>
    </form>
  );
};

export default ReleaseForm;