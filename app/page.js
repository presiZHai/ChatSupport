"use client";

import SignUp from "@/app/components/SignUp";
import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={styles.container}>
      <h1 style={{ ...styles.heading, textAlign: 'center', color: '#4CAF50' }}>
        You are welcome! I am a Multilingual Mental Health Support Bot.<br />
        Talk to me; you are in a safe space.
      </h1>
      <SignUp />
      <p style={styles.paragraph}>
        Already have an account?{" "}
        <Link href="/sign-in" style={styles.link}>Sign in here</Link>
      </p>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f0f0', // Optional: Light background color
    padding: '20px',
    boxSizing: 'border-box',
  },
  heading: {
    marginBottom: '10px', // Reduced spacing
    fontSize: '2em',
    color: '#333',
  },
  paragraph: {
    marginTop: '10px', // Reduced spacing
    fontSize: '1em',
    color: '#666',
  },
  link: {
    color: '#0070f3',
    textDecoration: 'underline',
  },
};