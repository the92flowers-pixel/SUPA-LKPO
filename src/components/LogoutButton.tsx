"use client";

import React from 'react';

const LogoutButton = () => {
  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    window.location.href = '/';
  };

  return (
    <button onClick={handleLogout}>Logout</button>
  );
};

export default LogoutButton;