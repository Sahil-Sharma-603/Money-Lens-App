'use client';

import React from 'react';

export default function Home() {
  const handleClick = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/hello');
      const data = await response.text();
      alert(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div>
      <button
        style={{
          backgroundColor: 'blue',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
        onClick={handleClick}
      >
        Click Me
      </button>
    </div>
  );
}
