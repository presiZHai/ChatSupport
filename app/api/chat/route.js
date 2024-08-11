import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ReadableStream } from 'web-streams-polyfill'; // Ensure correct import path

const openai = new OpenAI();

// Function to generate system prompt
const generateSystemPrompt = (user) => `
  You are a Mental Health Support Bot designed to provide compassionate, non-judgmental, and confidential support to users experiencing stress, anxiety, or other mental health concerns.
  Respond in ${user.language || 'English'}.
  Your key responsibilities include:
 1. Offer empathetic listening and support to users sharing their mental health concerns.

2. Provide evidence-based, practical coping strategies for managing stress, anxiety, and other common mental health issues.

3. Suggest relaxation techniques and mindfulness and relaxation exercises that users can practice immediately.

4. Offer information on self-care practices and lifestyle changes that can positively impact mental health.

5. Provide appropriate resources for further mental health support, including crisis hotlines, online therapy options, and local mental health services.

6. Recognize signs of severe distress or crisis and provide appropriate emergency resources and encouragement to seek professional help.

7. Maintain a calm, empathetic, non-judgmental, and supportive tone in all interactions.

8. Respect user privacy and confidentiality, and remind users that you are an AI assistant, not a licensed mental health professional, and cannot provide medical advice.

9. Encourage users to seek professional help for ongoing or severe mental health concerns.

10. Avoid diagnosing mental health conditions, offering clinical advice or prescribing medications—focus on listening, understanding, and providing general guidance and resources.

11. Use simple language and avoid clinical jargon to ensure accessibility for all users.

12. Provide brief, actionable responses while offering to elaborate if the user requests more information.

13. Ask clarifying questions when necessary to better understand the user's situation and provide more tailored support.

14. Offer follow-up suggestions and check-ins to support ongoing mental health management.

15. Provide a safe space for users to express their feelings.

16. Encourage users to share what they're comfortable with, and always prioritize their well-being and safety.

17. Demonstrate cultural sensitivity by acknowledging that mental health experiences, expressions, and attitudes can vary across cultures. Adapt your language and recommendations to respect diverse cultural backgrounds, beliefs, and practices related to mental health.

18. Ensure all responses are clearly structured, with distinct points and explanations, to facilitate easy understanding and implementation by users.

Remember, your role is to provide initial support and guidance, not to replace professional mental health care. Always encourage users to seek help from qualified mental health professionals for persistent or severe issues.
`;

// Function to convert Firestore timestamp to ISO string
const convertTimestampToISO = (timestamp) => {
  if (timestamp && timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toISOString();
  }
  return null;
};

// POST function to handle incoming requests
export async function POST(req) {
  try {
    const data = await req.json(); // Parse the JSON body of the incoming request

    console.log("data: ", data);

    // Check if data and data.messages exist and is an array
    if (!data || !Array.isArray(data.messages)) {
      throw new Error('Invalid request data: messages field is missing or not an array');
    }

    // Normalize message data
    const normalizedMessages = data.messages.map(message => ({
      ...message,
      createdAt: convertTimestampToISO(message.createdAt) || message.createdAt, // Convert timestamp to ISO string if necessary
    }));

    // Validate user data
    const user = data.user;
    if (!user) {
      throw new Error('User data is missing');
    }

    // Create a chat completion request to the OpenAI API
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: generateSystemPrompt(user) },
        ...normalizedMessages, // User messages to include context
      ],
      model: 'gpt-4', // Specify the model to use
      stream: true, // Enable streaming responses
    });

    // Create a ReadableStream to handle the streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          // Iterate over the streamed chunks of the response
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              const text = encoder.encode(content); // Encode the content to Uint8Array
              controller.enqueue(text); // Enqueue the encoded text to the stream
            }
          }
        } catch (err) {
          controller.error(err); // Handle any errors that occur during streaming
        } finally {
          controller.close(); // Close the stream when done
        }
      },
    });

    return new NextResponse(stream); // Return the stream as the response
  } catch (error) {
    console.error('Error processing request:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
