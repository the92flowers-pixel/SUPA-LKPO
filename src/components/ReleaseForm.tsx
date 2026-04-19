import React, { useState } from 'react';
import { supabase } from '../db/supabase';

const ReleaseForm = () => {
  const [release, setRelease] = useState({
    title: '',
    description: '',
    copyrights: '',
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await supabase.from('releases').insert([release]);
      console.log('Release added successfully!');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
      <input
        type="text"
        value={release.copyrights}
        onChange={(event) => setRelease({ ...release, copyrights: event.target.value })}
        placeholder="Copyrights"
      />
      {/* ... */}
    </form>
  );
};

export default ReleaseForm;