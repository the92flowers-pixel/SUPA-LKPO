"use client";

import React from 'react';
import { supabase } from '@/lib/supabase';

const ArtistDashboard = () => {
  const [releases, setReleases] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchArtistData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data } = await supabase.from('releases')
        .select('id, title, description, cover_url, streams')
        .eq('user_id', userData.user.id);
      
      if (data) setReleases(data);
    };
    fetchArtistData();
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
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ArtistDashboard;