"use client";

import React from 'react';
import { supabase } from '@/lib/supabase';

const AdminPanel = () => {
  const [releases, setReleases] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchReleases = async () => {
      const { data } = await supabase.from('releases')
        .select('id, title, description, cover_url, streams');
      if (data) setReleases(data);
    };
    fetchReleases();
  }, []);

  return (
    <div>
      <h1>My Releases</h1>
      <ul>
        {releases.map((release) => (
          <li key={release.id}>
            <h2>{release.title}</h2>
            <p>{release.description}</p>
            <img src={release.cover_url} alt="Release Image" />
            <p>Streams: {release.streams}</p>
            <button>Edit Release</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPanel;