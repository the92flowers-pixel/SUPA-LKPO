"use client";

import React from 'react';
import { supabaseClient } from '../supabase';

const ArtistDashboard = () => {
  const [releases, setReleases] = React.useState([]);

  React.useEffect(() => {
    // Get the artist's ID from the user's data
    const artistId = supabaseClient.from('artists').select('id').eq('username', 'artist');
    // Get the artist's releases
    supabaseClient.from('releases')
      .select('title, description, image, streams')
      .eq('artist_id', artistId[0].id)
      .then((data) => setReleases(data));
  }, []);

  return (
    <div>
      <h1>My Releases</h1>
      <ul>
        {releases.map((release) => (
          <li key={release.id}>
            <h2>{release.title}</h2>
            <p>{release.description}</p>
            <img src={release.image} alt="Release Image" />
            <p>Streams: {release.streams.join(', ')}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ArtistDashboard;