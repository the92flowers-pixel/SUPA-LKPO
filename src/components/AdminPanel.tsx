"use client";

import React from 'react';
import { supabaseClient } from '../supabase';

const AdminPanel = () => {
  const [releases, setReleases] = React.useState([]);

  React.useEffect(() => {
    // Get all releases
    supabaseClient.from('releases')
      .select('title, description, image, streams')
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
            <button>Edit Release</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPanel;