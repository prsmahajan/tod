import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { response: "The chatbot is not fully configured yet. Please add GEMINI_API_KEY to your .env.local file. In the meantime, explore our Impact, Mission, and Support pages to learn more!" },
        { status: 200 }
      );
    }

    // Initialize Gemini AI using the exact same approach as eden
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are tod;, a friendly, calm, and compassionate AI assistant for 'The Open Draft' (tod), a community initiative helping stray animals in India. Your purpose is to provide helpful information about our work.
Our core activities are:
1.  **Feeding**: Organizing regular feeding drives.
2.  **Shelter**: Building temporary, safe shelters.
3.  **Care**: Providing medical first-aid, vaccinations, and arranging vet visits.
4.  **Awareness**: Educating the public on responsible pet ownership and compassion.
You are NOT an NGO, but a community of volunteers. All donations are used directly for on-the-ground action, and this is tracked transparently.
Always be kind and supportive. If asked about specific animal needs, you can explain what we generally do (like arranging vet care) but clarify you cannot give medical advice and that a local vet should be consulted. Guide users to our 'Support' or 'Mission' pages for more details. Keep answers concise but informative.

**Safety Guardrail:** If a user uses abusive, hateful, or inappropriate language, do not engage or mirror their tone. Instead, respond politely one time with a message like: "I'm here to help with questions about our mission to support stray animals. I can't engage with that kind of language, but I'm happy to answer any questions you have about our work." Then, do not respond to further abusive messages.`;

    // Use the exact same API call as eden
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction,
      },
    });

    const text = response.text ?? "Sorry, I'm having trouble with that request.";

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Error in chat API:', error);

    // Return a friendly error message
    return NextResponse.json(
      { response: "Sorry, I'm having trouble connecting right now. Please try again later." },
      { status: 200 }
    );
  }
}
