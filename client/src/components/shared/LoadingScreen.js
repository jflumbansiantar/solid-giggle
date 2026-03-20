import React from 'react';

function LoadingScreen({ message = 'Loading…' }) {
  return (
    <div className="loading-screen">
      <div className="spinner" />
      <span>{message}</span>
    </div>
  );
}

export default LoadingScreen;
