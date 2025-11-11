// API route for Hume AI Emotion Detection
// Analyzes emotional tone from user text using Hume's Language Model

import { NextRequest, NextResponse } from 'next/server';
import { HumeClient } from 'hume';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Initialize Hume client
    const client = new HumeClient({
      apiKey: process.env.HUME_API_KEY ?? '',
    });

    // Start emotion detection job using language model
    const job = await client.expressionMeasurement.batch.startInferenceJob({
      models: {
        language: {
          granularity: 'sentence', // Analyze at sentence level
        },
      },
      text: [text], // Text to analyze
    });

    console.log('Emotion detection job started:', job.jobId);

    // Wait for job completion
    await job.awaitCompletion();

    // Get predictions
    const predictions = await client.expressionMeasurement.batch.getJobPredictions(job.jobId);

    // Extract emotion scores from predictions
    const results = predictions?.[0]?.results?.predictions?.[0]?.models?.language?.groupedPredictions?.[0]?.predictions?.[0];
    
    if (!results || !results.emotions) {
      // Return neutral if no emotions detected
      return NextResponse.json({
        emotions: {
          Joy: 0.4,
          Sadness: 0.2,
          Anxiety: 0.2,
          Calmness: 0.5,
          Confidence: 0.4,
        },
        topEmotion: 'Calmness',
        emotionIntensity: 'moderate',
        allEmotions: [],
      });
    }

    // Map emotions to object
    const emotionMap: Record<string, number> = {};
    results.emotions.forEach((emotion: any) => {
      emotionMap[emotion.name] = emotion.score;
    });

    // Sort emotions by score
    const sortedEmotions = [...results.emotions].sort((a: any, b: any) => b.score - a.score);
    const topEmotion = sortedEmotions[0]?.name || 'Calmness';
    const topScore = sortedEmotions[0]?.score || 0.5;

    // Determine intensity
    let emotionIntensity: 'low' | 'moderate' | 'high' = 'low';
    if (topScore > 0.7) emotionIntensity = 'high';
    else if (topScore > 0.4) emotionIntensity = 'moderate';

    return NextResponse.json({
      emotions: {
        Joy: emotionMap['Joy'] || 0,
        Sadness: emotionMap['Sadness'] || 0,
        Anxiety: emotionMap['Anxiety'] || 0,
        Calmness: emotionMap['Calmness'] || 0,
        Confidence: emotionMap['Confidence'] || 0,
        Excitement: emotionMap['Excitement'] || 0,
        Contentment: emotionMap['Contentment'] || 0,
        Determination: emotionMap['Determination'] || 0,
      },
      topEmotion,
      emotionIntensity,
      allEmotions: sortedEmotions.slice(0, 5).map((e: any) => ({
        name: e.name,
        score: Math.round(e.score * 100) / 100, // Round to 2 decimals
      })),
    });
  } catch (error) {
    console.error('Emotion detection error:', error);
    // Return neutral state on error - don't break the chat
    return NextResponse.json({
      emotions: {
        Joy: 0.4,
        Sadness: 0.2,
        Anxiety: 0.2,
        Calmness: 0.5,
        Confidence: 0.4,
      },
      topEmotion: 'Calmness',
      emotionIntensity: 'moderate',
      allEmotions: [],
    });
  }
}
