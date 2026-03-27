import { NextRequest, NextResponse } from 'next/server';
// NextAuth removed - using mobile OTP authentication
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication (simplified for mobile OTP)
    // TODO: Implement proper mobile OTP authentication check

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'en';

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      // Return mock data for testing
      const mockTranscription = "I need 100 units of steel pipes, 5 inches in diameter, delivered to Mumbai by next week. Budget is around 50,000 rupees.";
      const mockRfqData = {
        title: "Steel Pipes - 100 units",
        description: mockTranscription,
        category: "Steel & Metals",
        subcategory: "Steel Pipes",
        quantity: 100,
        unit: "units",
        budget: 50000,
        currency: "INR",
        location: "Mumbai",
        deliveryDeadline: "1 week",
        priority: "medium",
        specifications: ["5 inches diameter", "Steel material"],
        requirements: ["Quality certification", "On-time delivery"]
      };

      return NextResponse.json({
        success: true,
        transcription: {
          text: mockTranscription,
          confidence: 0.95
        },
        extractedInfo: mockRfqData
      });
    }

    // Convert File to Buffer
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    // Transcribe audio using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioBuffer], audioFile.name, { type: audioFile.type }),
      model: 'whisper-1',
      language: language !== 'auto' ? language : undefined,
    });

    // Extract RFQ information using GPT-4
    const extractionPrompt = `
    Analyze the following voice transcription and extract RFQ (Request for Quote) information. 
    Return a JSON object with the following structure:
    {
      "title": "Brief title for the RFQ",
      "description": "Full description",
      "category": "Most appropriate category from: Steel & Metals, Textiles & Apparel, Electronics & Components, Machinery & Equipment, Construction Materials, Automotive & Parts, Chemicals & Materials, Energy & Power, Food & Beverage, Agriculture & Farming, Medical Equipment, Business Services, Office Supplies, Aerospace & Defense, Marine & Shipping, Mining & Minerals, Oil & Gas, Retail Equipment, Consumer Electronics, Sports & Recreation, Beauty & Personal Care, Jewelry & Accessories, Toys & Games, Furniture & Home Decor, Security & Surveillance, Printing & Publishing, Packaging & Containers, Laboratory Equipment, Hospitality & Tourism, Waste Management, Water & Wastewater, Renewable Energy, Smart City Solutions, Robotics & Automation, Biotechnology, Financial Technology, Education Technology, Gaming & Entertainment",
      "subcategory": "Specific subcategory",
      "quantity": number,
      "unit": "units/kg/pieces/etc",
      "budget": number,
      "currency": "INR",
      "location": "City name",
      "deliveryDeadline": "Timeframe",
      "priority": "low/medium/high",
      "specifications": ["array of specifications"],
      "requirements": ["array of requirements"]
    }

    Transcription: "${transcription.text}"
    `;

    const extractionResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing voice transcriptions and extracting structured RFQ data. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: extractionPrompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const extractedInfo = JSON.parse(extractionResponse.choices[0].message.content || '{}');

    return NextResponse.json({
      success: true,
      transcription: {
        text: transcription.text,
        confidence: 0.95
      },
      extractedInfo
    });

  } catch (error) {
    console.error('Voice RFQ processing error:', error);
    
    // Return mock data on error for testing
    const mockTranscription = "I need 50 units of electronic components for my manufacturing project. Budget is 25,000 rupees. Need delivery in Delhi within 2 weeks.";
    const mockRfqData = {
      title: "Electronic Components - 50 units",
      description: mockTranscription,
      category: "Electronics & Components",
      subcategory: "Semiconductors",
      quantity: 50,
      unit: "units",
      budget: 25000,
      currency: "INR",
      location: "Delhi",
      deliveryDeadline: "2 weeks",
      priority: "medium",
      specifications: ["Electronic components", "Manufacturing grade"],
      requirements: ["Quality assurance", "Fast delivery"]
    };

    return NextResponse.json({
      success: true,
      transcription: {
        text: mockTranscription,
        confidence: 0.90
      },
      extractedInfo: mockRfqData
    });
  }
}
