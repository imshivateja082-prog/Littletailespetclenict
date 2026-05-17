import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

const PET_CARE_SYSTEM_PROMPT = `You are a friendly and knowledgeable veterinary AI assistant for "Little Tails" veterinary clinic. Your role is to:

1. Provide general pet health guidance and information
2. Answer frequently asked questions about pet care
3. Offer pet care suggestions and tips
4. Help users understand common pet health issues
5. Suggest when to seek professional veterinary care

IMPORTANT GUIDELINES:
- Always be friendly, empathetic, and professional
- Never diagnose specific conditions - always recommend consulting a veterinarian for medical concerns
- Provide general information about pet nutrition, grooming, exercise, and wellness
- If asked about emergencies, always advise to seek immediate veterinary attention
- Use simple, easy-to-understand language
- Add relevant emojis to make the conversation more engaging 🐾
- If unsure, say so and recommend consulting the clinic directly
- You can discuss: vaccinations, nutrition, grooming, basic first aid, behavior, exercise, common symptoms
- Always remind that your advice is general and not a substitute for professional veterinary care`;

// Fallback responses when no API key is configured
const FALLBACK_RESPONSES: Record<string, string> = {
  vaccination: "🐾 Vaccinations are essential for your pet's health! Core vaccines for dogs include Rabies, Distemper, Parvovirus, and Adenovirus. For cats, core vaccines include Rabies, Feline Distemper, Calicivirus, and Herpesvirus. I recommend scheduling a vaccination consultation at Little Tails to get a personalized vaccination plan! 💉",
  food: "🍖 Good nutrition is the foundation of pet health! Dogs need a balanced diet of protein, fats, carbohydrates, vitamins, and minerals. Avoid giving pets chocolate, grapes, onions, and xylitol. For personalized nutrition advice, our Pet Food & Nutrition service at Little Tails can help! 🥗",
  grooming: "✨ Regular grooming keeps your pet healthy and happy! Brush your dog's coat 2-3 times per week, clean ears weekly, trim nails every 2-3 weeks, and bathe monthly. For cats, brush 1-2 times per week. Book a grooming appointment at Little Tails for professional care! 🛁",
  emergency: "🚨 If your pet is experiencing an emergency (difficulty breathing, seizures, severe bleeding, poisoning, etc.), please seek immediate veterinary care! Contact Little Tails clinic right away or visit the nearest emergency animal hospital. Time is critical in emergencies! 🏥",
  default: "🐾 Thank you for your question! I'm here to help with general pet care guidance. For specific medical concerns, I always recommend consulting with our veterinarians at Little Tails clinic. You can book an appointment through your dashboard. Is there anything specific about pet care I can help you with? 😊"
};

function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('vaccin') || lowerMessage.includes('shot') || lowerMessage.includes('immuniz')) {
    return FALLBACK_RESPONSES.vaccination;
  }
  if (lowerMessage.includes('food') || lowerMessage.includes('diet') || lowerMessage.includes('nutrition') || lowerMessage.includes('eat') || lowerMessage.includes('feed')) {
    return FALLBACK_RESPONSES.food;
  }
  if (lowerMessage.includes('groom') || lowerMessage.includes('bath') || lowerMessage.includes('brush') || lowerMessage.includes('nail') || lowerMessage.includes('hair')) {
    return FALLBACK_RESPONSES.grooming;
  }
  if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent') || lowerMessage.includes('bleeding') || lowerMessage.includes('poison') || lowerMessage.includes('choking')) {
    return FALLBACK_RESPONSES.emergency;
  }

  // Additional pet care responses
  if (lowerMessage.includes('exercise') || lowerMessage.includes('walk') || lowerMessage.includes('play')) {
    return "🏃 Exercise is crucial for your pet's physical and mental health! Dogs typically need 30-60 minutes of exercise daily, depending on breed and age. Puppies need shorter, more frequent play sessions. Cats benefit from 15-20 minutes of interactive play daily. Regular exercise helps prevent obesity and behavioral issues! 🎾";
  }
  if (lowerMessage.includes('tick') || lowerMessage.includes('flea') || lowerMessage.includes('parasite') || lowerMessage.includes('worm')) {
    return "🛡️ Parasite prevention is vital! Use veterinarian-recommended flea and tick preventatives year-round. Regular deworming is also important. Check your pet for ticks after outdoor activities. At Little Tails, we can recommend the best parasite prevention plan for your pet! 💊";
  }
  if (lowerMessage.includes('training') || lowerMessage.includes('behavior') || lowerMessage.includes('bark') || lowerMessage.includes('bite')) {
    return "🎓 Training and socialization are key to a well-behaved pet! Use positive reinforcement techniques. Start training early and be consistent. Short, frequent sessions work best. If you're dealing with behavioral issues, our vets at Little Tails can help rule out medical causes and recommend certified trainers! 🐕";
  }
  if (lowerMessage.includes('dental') || lowerMessage.includes('teeth') || lowerMessage.includes('breath')) {
    return "🦷 Dental health is often overlooked but very important! Brush your pet's teeth 2-3 times per week with pet-safe toothpaste. Dental chews can also help. Look out for bad breath, drooling, or difficulty eating - these may indicate dental problems. Schedule a dental checkup at Little Tails! 😁";
  }
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "👋 Hello there, pet parent! Welcome to Little Tails AI Assistant! 🐾 I'm here to help you with:\n\n• General pet health questions\n• Nutrition and diet advice\n• Grooming tips\n• Vaccination information\n• Exercise recommendations\n• And more!\n\nWhat would you like to know about caring for your furry friend? 😊";
  }

  return FALLBACK_RESPONSES.default;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        userId: session.userId,
        role: 'user',
        content: message,
      },
    });

    let aiResponse: string;

    // Try OpenAI first, then Gemini, then fallback
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key') {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: PET_CARE_SYSTEM_PROMPT },
              { role: 'user', content: message },
            ],
            max_tokens: 500,
            temperature: 0.7,
          }),
        });

        const data = await response.json();
        aiResponse = data.choices?.[0]?.message?.content || getFallbackResponse(message);
      } catch {
        aiResponse = getFallbackResponse(message);
      }
    } else if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key') {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: `${PET_CARE_SYSTEM_PROMPT}\n\nUser: ${message}` }],
              }],
            }),
          }
        );

        const data = await response.json();
        aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || getFallbackResponse(message);
      } catch {
        aiResponse = getFallbackResponse(message);
      }
    } else {
      // Use fallback responses
      aiResponse = getFallbackResponse(message);
    }

    // Save AI response
    await prisma.chatMessage.create({
      data: {
        userId: session.userId,
        role: 'assistant',
        content: aiResponse,
      },
    });

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Get chat history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
