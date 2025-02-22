'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePlaidLink } from 'react-plaid-link';

export default function Home() {
  const [linkToken, setLinkToken] = useState<string | null>(null);

  // Fetch a link token from the backend on component mount
  useEffect(() => {
    const fetchLinkToken = async () => {
      try {
        const res = await fetch(
          'http://localhost:5001/api/plaid/create_link_token',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        const data = await res.json();
        if (data.link_token) {
          setLinkToken(data.link_token);
          console.log('Received link token:', data.link_token);
        } else {
          console.error('No link token in response:', data);
        }
      } catch (error) {
        console.error('Error fetching link token:', error);
      }
    };
    fetchLinkToken();
  }, []);

  const onSuccess = async (public_token: string, metadata: any) => {
    console.log('Plaid onSuccess – public_token:', public_token);
    try {

      // Exchange the public_token for an access token on the backend
      const tokenExchangeResponse = await fetch(
        'http://localhost:5001/api/plaid/set_access_token',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_token }),
        }
      );

      const tokenData = await tokenExchangeResponse.json();
      console.log('Token exchange response:', tokenData);

      // const historicalResponse = await fetch(
      //   'http://localhost:5001/api/plaid/transactions/historical',
      //   {
      //     method: 'GET',
      //   }
      // );
      //   const historicalData = await historicalResponse.json();
      //   console.log('Historical transactions:', historicalData);
  
      // Now call the transactions endpoint (which uses transactionsSync behind the scenes)
      const transactionsResponse = await fetch(
        'http://localhost:5001/api/plaid/transactions',
        {
          method: 'GET',
        }
      );
      const transactionsData = await transactionsResponse.json();
      console.log('Transactions received:', transactionsData);
      alert('Transactions loaded! Check the console for details.');
    } catch (error) {
      console.error('Error during Plaid flow:', error);
      alert('There was an error connecting your bank account.');
    }
  };

  // Only initialize the Plaid config when we have a valid linkToken
  const config = {
    token: linkToken!,
    onSuccess,
  };

  const { open, ready } = usePlaidLink(linkToken ? config : { token: '' });

  return (
    <div style={{ padding: '40px' }}>
      <h1>Welcome to Money-Lens App</h1>

      {/* Button to launch Plaid Link */}
      <button
        style={{
          backgroundColor: 'green',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: linkToken && ready ? 'pointer' : 'not-allowed',
          marginBottom: '10px',
        }}
        onClick={() => open()}
        disabled={!linkToken || !ready}
      >
        Connect a bank account
      </button>

      <br />

      {/* Navigation button to Dashboard */}
      <Link href="/dashboard">
        <button
          style={{
            backgroundColor: 'blue',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Go to Dashboard
        </button>
      </Link>
    </div>
  );
}
