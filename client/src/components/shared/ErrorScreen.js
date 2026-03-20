import React from 'react';

function ErrorScreen({ message }) {
  return (
    <div className="error-screen">
      <span>⚠ {message}</span>
      <small>Make sure the backend server is running on port 5000.</small>
    </div>
  );
}

export default ErrorScreen;
