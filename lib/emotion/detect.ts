// Emotion Detection Helper
// Calls the Hume AI emotion-detect API and returns emotion data

export interface EmotionData {
  emotions: {
    Joy: number;
    Sadness: number;
    Anxiety: number;
    Calmness: number;
    Confidence: number;
    Excitement?: number;
    Contentment?: number;
    Determination?: number;
  };
  topEmotion: string;
  emotionIntensity: 'low' | 'moderate' | 'high';
  allEmotions: Array<{ name: string; score: number }>;
}

/**
 * Detect emotions from user text using Hume AI
 * @param text - The user's message text
 * @returns EmotionData or null if detection fails
 */
export async function detectEmotions(text: string): Promise<EmotionData | null> {
  try {
    if (!text || text.trim().length === 0) {
      return null;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/emotion-detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      console.error('Emotion detection failed:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error detecting emotions:', error);
    return null;
  }
}

/**
 * Build emotion context string for AI prompts
 * @param emotions - EmotionData from detectEmotions
 * @returns Formatted string for AI context
 */
export function buildEmotionContext(emotions: EmotionData | null): string {
  if (!emotions) return '';

  let context = `\n\n🎭 USER'S EMOTIONAL STATE (detected, DO NOT acknowledge directly):\n`;
  context += `- Top Emotion: ${emotions.topEmotion} (${emotions.emotionIntensity} intensity)\n`;
  
  // Add top 3 emotions
  const top3 = emotions.allEmotions.slice(0, 3);
  if (top3.length > 0) {
    context += `- Key Emotions: ${top3.map(e => `${e.name} (${Math.round(e.score * 100)}%)`).join(', ')}\n`;
  }

  context += `\nADJUST YOUR TONE based on their emotional state:\n`;
  
  // Specific guidance based on top emotion
  if (emotions.topEmotion === 'Anxiety' || emotions.topEmotion === 'Distress') {
    context += `- They're anxious/distressed: Be extra gentle, validating, reassuring. Offer smaller steps.\n`;
  } else if (emotions.topEmotion === 'Sadness' || emotions.topEmotion === 'Disappointment') {
    context += `- They're sad/disappointed: Validate their feelings. Don't rush to fix. Just be present.\n`;
  } else if (emotions.topEmotion === 'Joy' || emotions.topEmotion === 'Excitement') {
    context += `- They're joyful/excited: Match their energy! Celebrate with them!\n`;
  } else if (emotions.topEmotion === 'Anger' || emotions.topEmotion === 'Frustration') {
    context += `- They're angry/frustrated: Validate their frustration. Don't minimize it.\n`;
  } else if (emotions.topEmotion === 'Calmness' || emotions.topEmotion === 'Contentment') {
    context += `- They're calm/content: Provide clear, structured guidance.\n`;
  } else if (emotions.topEmotion === 'Determination' || emotions.topEmotion === 'Concentration') {
    context += `- They're determined/focused: Support their momentum. Keep it brief.\n`;
  }

  context += `- IMPORTANT: Don't say "I can sense you're feeling X" - just naturally adjust your tone.\n`;

  return context;
}
