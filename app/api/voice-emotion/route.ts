// API route for Hume AI Voice Emotion Detection
// Analyzes emotional tone from voice using prosody model

import { NextRequest, NextResponse } from 'next/server';
import { HumeClient } from 'hume';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
    }

    // Convert File to Buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Initialize Hume client
    const client = new HumeClient({
      apiKey: process.env.HUME_API_KEY ?? '',
    });

    // Create a temporary file URL (in production, upload to cloud storage)
    // For now, we'll use Hume's batch API with base64 encoded audio
    const base64Audio = buffer.toString('base64');
    const audioDataUrl = `data:audio/webm;base64,${base64Audio}`;

    // Start emotion detection job using prosody (voice tone) model
    const job = await client.expressionMeasurement.batch.startInferenceJob({
      models: {
        prosody: {
          granularity: 'utterance', // Analyze entire utterance
        },
      },
      urls: [audioDataUrl], // Hume accepts data URLs
    });

    console.log('Voice emotion detection job started:', job.jobId);

    // Wait for job completion
    await job.awaitCompletion();

    // Get predictions
    const predictions = await client.expressionMeasurement.batch.getJobPredictions(job.jobId);

    // Extract emotion scores from voice prosody
    const results = predictions?.[0]?.results?.predictions?.[0]?.models?.prosody?.groupedPredictions?.[0]?.predictions?.[0];
    
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
        score: Math.round(e.score * 100) / 100,
      })),
    });
  } catch (error) {
    console.error('Voice emotion detection error:', error);
    // Return neutral state on error
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
