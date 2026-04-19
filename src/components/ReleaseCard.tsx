"use client";

import React from 'react';
import { useSupabase } from '../supabase';

const ReleaseCard = ({ release }) => {
  const { data, error } = useSupabase.query('releases', `SELECT * FROM releases WHERE id = $1`, [release.id]);

  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return (
    <div>
      <h2>{data.release.title}</h2>
      <p>Release Date: {data.release.date}</p>
      <img src={data.release.coverImage} alt="Cover Image" />
    </div>
  );
};

export default ReleaseCard;