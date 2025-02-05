'use client';

import React from 'react';
import Link from 'next/link';

export default function Home() {
  const handleClick = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/users/hello');
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
          marginBottom: '10px'
        }}
        onClick={handleClick}
      >
        Click Me
      </button>

      <br />

      {/* Eventually this can be replaced with a login button */}
      <Link href="/dashboard">
        <button
          style={{
            backgroundColor: 'blue',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '10px'
          }}
        >
          Go to Dashboard 
        </button>
      </Link>
    </div>
  );
}
