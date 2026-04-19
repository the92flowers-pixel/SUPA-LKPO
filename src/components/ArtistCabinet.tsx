"use client";

import React from 'react';
import { GetReleaseData } from '../api';

const ArtistCabinet = () => {
  const [release, setRelease] = useState(null);

  useEffect(() => {
    GetReleaseData().then((data) => setRelease(data));
  }, []);

  if (!release) return <div>Loading...</div>;

  return (
    <div>
      {/* ... */}
      <h2>Release Information</h2>
      <p>{release.title}</p>
      <p>{release.description}</p>
      <p>Release Date: {release.releaseDate}</p>
    </div>
  );
};

export default ArtistCabinet;