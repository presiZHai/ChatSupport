"use client";

import { useState } from 'react';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { auth } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/sign-in'); // Redirect to sign-in page after successful sign-up
    } catch (err) {
      console.error('Error signing up:', err);
      setError(err.message); // Set error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#f5f5f5",
      }}
    >
      <form onSubmit={handleSignUp} style={{ width: "100%", maxWidth: "400px" }}>
        <Stack spacing={2} padding={3} backgroundColor="white" borderRadius={2} boxShadow={3}>
          <Typography variant="h5" textAlign="center">Sign Up</Typography>
          <TextField
            label="Email"
            type="email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </Button>
          {error && <Typography color="error">{error}</Typography>}
        </Stack>
      </form>
    </div>
  );
}