"use client";

import React from 'react';
import { Toaster } from 'react-hot-toast';

const ToastProvider = () => {
  return (
    <Toaster>
      <div className="toast">
        <h2>Release Information</h2>
        <p>Artist Name: {artist.name}</p>
        <img src={artist.coverImage} alt="Cover Image" />
      </div>
    </Toaster>
  );
};

export default ToastProvider;