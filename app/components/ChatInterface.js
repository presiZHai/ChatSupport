"use client";

import { Box, Button, Stack, TextField } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { auth, firestore } from '@/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { francAll } from 'franc'; // Import the language detection library

export default function ChatInterface() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/sign-in");
    } else {
      fetchMessages();
    }
  }, [user, loading, fetchMessages, router]);

  const fetchMessages = async () => {
    const q = query(
      collection(firestore, "messages"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "asc")
    );
    const querySnapshot = await getDocs(q);
    const userMessages = querySnapshot.docs.map((doc) => doc.data());
    console.log("userMessages fetch: ", userMessages);
    const defaultMessage =     {
      role: 'assistant',
      content: "Hello! I'm a  Multilingual Mental Health Support Bot offering confidential assistance. How are you feeling today? What would you like to discuss about your well-being?",
    };
    setMessages([defaultMessage, ...userMessages]);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    if (!user) return;

    setIsLoading(true);

    // Detect language and use only the most likely language code
    const detectedLanguage = francAll(message)[0][0] || 'und'; // Default to 'und' if detection fails

    const newMessage = {
      role: "user",
      content: message,
      uid: user.uid,
      createdAt: new Date(),
      language: detectedLanguage,  // Store only the language code
    };

    try {
      await addDoc(collection(firestore, "messages"), newMessage);

      const recentMessages = [...messages, newMessage].slice(-10); // Maintain a sliding window of last 10 messages

      setMessages([...recentMessages, { role: 'assistant', content: '' }]);

      const q = query(
        collection(firestore, "messages"),
        where("uid", "==", user.uid),
        orderBy("createdAt", "asc")
      );
    const querySnapshot = await getDocs(q);
    // const userMessages = querySnapshot.docs.map((doc) => doc.data());
    const payload = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        collectionId: "messages",  // Manually add the collection ID
        docId: doc.id, // Optionally include the document ID for further reference
      };
    });
      // console.log("userMessages: ", userMessages)
      console.log("payload: ", payload)
      console.log("querySnapshot: ", querySnapshot)
      
      const userObject = {
        uid: user.uid,               // User ID from auth state
        language: recentMessages[0]?.language || 'en', // Default to the first message's language or English
      };

      const requestData = {
        messages: recentMessages,
        user: userObject
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify(recentMessages),
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        console.log("response: ", response)
        throw new Error('Network response was not okay');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let lastMessage = { role: 'assistant', content: '' };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });

        lastMessage = {
          ...lastMessage,
          content: lastMessage.content + text,
        };

        console.log("lastMessage: ", lastMessage);

        setMessages((messages) => {
          const otherMessages = messages.slice(0, -1); // Remove the placeholder
          return [...otherMessages, lastMessage];
        });
      }

      console.log('All text for lastMessage has been received:', lastMessage.content);

      if (lastMessage.content) {
      // Detect language and use only the most likely language code
    const lang = francAll(lastMessage.content)[0][0] || 'und'; // Default to 'und' if detection fails

    const newMsg = {
      role: "assistant",
      content: lastMessage.content,
      uid: user.uid,
      createdAt: new Date(),
      language: lang,  // Store only the language code
    };

    await addDoc(collection(firestore, "messages"), newMsg);
  }
    } catch (error) {
      console.error('Error:', error);
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: 'An error occurred. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
      setMessage(''); // Clear input field
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <Box
      width="100vw"
      height="90vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    > 
      <Stack
        direction={'column'}
        width="100%"
        height="700px"
        border="1px solid black"
        p={2}
        spacing={3}
      >
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? 'primary.main'
                    : 'secondary.main'
                }
                color="white"
                borderRadius={16}
                p={3}
              >
                {/* <p>{JSON.stringify(message)}</p> */}
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}