"use client";

import React from 'react';
import { GetReleaseData } from '../api';

const AdminPanel = () => {
  const [releases, setReleases] = useState([]);

  useEffect(() => {
    GetReleaseData().then((data) => setReleases(data));
  }, []);

  if (!releases) return <div>Loading...</div>;

  return (
    <div>
      {/* ... */}
      <h2>Releases</h2>
      {releases.map((release) => (
        <div key={release.id}>
          <p>{release.title}</p>
          <p>{release.description}</p>
          <p>Release Date: {release.releaseDate}</p>
          {/* Display release data */}
          <Field label="Release Data">
            {({ input }) => (
              <textarea
                value={JSON.stringify(release)}
                onChange={(e) => {
                  const updatedData = JSON.parse(e.target.value);
                  supabase
                    .from('releases')
                    .update('data', updatedData)
                    .eq('id', release.id)
                    .exec();
                }}
              />
            )}
          </Field>
        </div>
      ))}
    </div>
  );
};

export default AdminPanel;