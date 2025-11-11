import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    // Mock response from Navia for peer matching onboarding
    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage.content.toLowerCase();

    let response = '';

    // Simple pattern matching for onboarding questions
    if (messages.length === 1) {
      // First response after initial question
      response = "I hear you. That's really important to find support for. Are you looking for someone who's going through something similar right now, or someone who's been through it and can guide you?";
    } else if (messages.length === 2) {
      // Second response - add the "ready to find matches" prompt
      if (userMessage.includes('similar') || userMessage.includes('same') || userMessage.includes('peer')) {
        response = "Got it! Finding peers who are in it with you right now. That shared experience can be so validating. 💛 Great! I think I have a good sense of what you're looking for. Ready to see your matches? Click \"Find My Matches\" below when you're ready! 💛";
      } else if (userMessage.includes('guide') || userMessage.includes('mentor') || userMessage.includes('been there')) {
        response = "Perfect! Looking for people who've navigated this path before. Their experience can be so helpful. 💛 Great! I think I have a good sense of what you're looking for. Ready to see your matches? Click \"Find My Matches\" below when you're ready! 💛";
      } else {
        response = "I understand. Let me find people who can support you with that. 💛 Great! I think I have a good sense of what you're looking for. Ready to see your matches? Click \"Find My Matches\" below when you're ready! 💛";
      }
    } else {
      // Any additional messages - always include the prompt
      response = "Thanks for sharing that! I'm finding peers who really get it. Great! I think I have a good sense of what you're looking for. Ready to see your matches? Click \"Find My Matches\" below when you're ready! 💛";
    }

    // Return streaming response to match UniversalNavia's expectations
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Send the response as a stream
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: response })}\n\n`));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in onboarding chat:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
