import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import formidable from 'formidable';
import fs from 'fs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new formidable.IncomingForm();
    
    const [fields, files] = await form.parse(req);
    const audioFile = files.audio?.[0];

    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Read the file buffer
    const buffer = fs.readFileSync(audioFile.filepath);

    // Create a File-like object for OpenAI
    const file = new File([buffer], 'recording.wav', { type: 'audio/wav' });

    // Transcribe audio using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en', // You can make this dynamic based on user preference
      response_format: 'text',
    });

    // Process the transcription to extract RFQ data
    const processedTranscript = await processTranscript(transcription);

    res.status(200).json({
      transcript: transcription,
      processedData: processedTranscript,
    });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
}

async function processTranscript(transcript: string): Promise<any> {
  try {
    // Use GPT-4 to extract structured RFQ data from the transcript
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant that extracts RFQ (Request for Quote) information from voice transcripts. 
          Extract the following information and return it as JSON:
          - title: Product or service title
          - description: Detailed description
          - category: Product category
          - quantity: Quantity needed
          - budget: Budget range
          - timeline: Delivery timeline
          - milestones: Array of payment milestones (if mentioned)
          - milestoneAmounts: Array of amounts for each milestone
          
          If any information is not mentioned, use null for that field.`
        },
        {
          role: 'user',
          content: `Extract RFQ information from this transcript: "${transcript}"`
        }
      ],
      temperature: 0.3,
    });

    const response = completion.choices[0].message.content;
    
    try {
      return JSON.parse(response || '{}');
    } catch (parseError) {
      console.error('Error parsing GPT response:', parseError);
      return {
        title: null,
        description: transcript,
        category: null,
        quantity: null,
        budget: null,
        timeline: null,
        milestones: [],
        milestoneAmounts: [],
      };
    }
  } catch (error) {
    console.error('Error processing transcript:', error);
    return {
      title: null,
      description: transcript,
      category: null,
      quantity: null,
      budget: null,
      timeline: null,
      milestones: [],
      milestoneAmounts: [],
    };
  }
}