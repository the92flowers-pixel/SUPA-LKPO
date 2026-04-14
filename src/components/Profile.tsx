"use client";

import React from 'react';

const Profile = () => {
  return (
    <div>
      <h1>Profile</h1>
      <form>
        <input type="text" placeholder="Username" />
        <input type="email" placeholder="Email" />
        <button>Create Profile</button>
      </form>
    </div>
  );
};

export default Profile;