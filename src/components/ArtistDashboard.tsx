"use client";

import React from 'react';
import { useSupabase } from '../supabase';

const ArtistDashboard = ({ artist }) => {
  const { data, error } = useSupabase.query('releases', `SELECT * FROM releases WHERE artist_id = $1`, [artist.id]);

  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return (
    <div>
      <h2>{artist.name}</h2>
      <p>Release Date: {data[0].date}</p>
      <img src={data[0].coverImage} alt="Cover Image" />
    </div>
  );
};

export default ArtistDashboard;