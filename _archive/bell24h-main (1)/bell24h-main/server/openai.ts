import OpenAI from 'openai';

// Create OpenAI client
// Note: This assumes the OpenAI API key is provided in environment variables
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Check if OpenAI API key exists
if (!process.env.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY is not set. Voice and AI features will not work properly.');
}

/**
 * Processes a voice-based RFQ submission
 * @param audioBase64 Base64-encoded audio data
 * @param languagePreference Optional language preference (ISO code, e.g., 'en', 'hi', or 'auto' for auto-detection)
 * @returns Transcription, language information, and extracted RFQ information
 */
export async function processVoiceRFQ(audioBase64: string, languagePreference: string = 'auto') {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured.');
    }

    // Convert base64 to Buffer
    const audioBuffer = Buffer.from(audioBase64, 'base64');

    // Create a temporary file with the audio data
    const tempFilePath = `/tmp/voice-rfq-${Date.now()}.webm`;
    require('fs').writeFileSync(tempFilePath, audioBuffer);

    // Apply audio enhancement if needed (higher quality transcription)
    const enhancedFilePath = await enhanceAudioQuality(tempFilePath);
    
    // Transcribe the audio
    const transcription = await openai.audio.transcriptions.create({
      file: require('fs').createReadStream(enhancedFilePath || tempFilePath),
      model: 'whisper-1',
      language: languagePreference !== 'auto' ? languagePreference : undefined,
    });

    // Clean up temp files
    require('fs').unlinkSync(tempFilePath);
    if (enhancedFilePath && enhancedFilePath !== tempFilePath) {
      require('fs').unlinkSync(enhancedFilePath);
    }

    // Detect language
    const detectedLanguage = await detectLanguage(transcription.text);
    
    // Translate if necessary
    let translatedText: string | null = null;
    if (detectedLanguage !== 'en') {
      translatedText = await translateText(transcription.text, detectedLanguage, 'en');
    }
    
    // Extract RFQ information from transcription
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: 'system',
          content: `You are an AI expert at extracting RFQ (Request for Quotation) details from spoken text. 
          Extract the following information in JSON format:
          - title: A concise title for the RFQ
          - description: Detailed description of what is being requested
          - category: The product or service category (e.g., "Electronics", "Manufacturing", "Software")
          - quantity: The quantity being requested (numeric)
          - budget: The budget or price range (numeric, without currency symbols)
          - deliveryDeadline: Delivery deadline formatted as YYYY-MM-DD or null if not mentioned
          
          Only include these fields in your response, formatted as a valid JSON object.`
        },
        {
          role: 'user',
          content: translatedText || transcription.text
        }
      ],
      response_format: { type: 'json_object' }
    });

    // Parse the JSON response
    const extractedInfo = JSON.parse(completion.choices[0].message.content || '{}');

    return {
      text: transcription.text,
      translatedText,
      detectedLanguage,
      extractedInfo
    };
  } catch (error: any) {
    console.error('Error processing voice RFQ:', error);
    throw new Error(`Failed to process voice RFQ: ${error.message}`);
  }
}

/**
 * Detects the language of a text
 * @param text The text to detect language for
 * @returns ISO language code (e.g., 'en', 'hi')
 */
async function detectLanguage(text: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: 'system',
          content: `You are a language detection expert. Detect the language of the provided text.
          Respond with the ISO 639-1 language code only (e.g., 'en' for English, 'hi' for Hindi, etc.).
          Return only the 2-letter code, nothing else.`
        },
        {
          role: 'user',
          content: text
        }
      ]
    });

    return completion.choices[0].message.content?.trim().toLowerCase() || 'en';
  } catch (error) {
    console.error('Error detecting language:', error);
    return 'en'; // Default to English on error
  }
}

/**
 * Translates text from one language to another
 * @param text Text to translate
 * @param sourceLanguage Source language code
 * @param targetLanguage Target language code
 * @returns Translated text
 */
async function translateText(text: string, sourceLanguage: string, targetLanguage: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text from ${sourceLanguage} to ${targetLanguage}.
          Maintain the original meaning, tone, and intent as closely as possible.`
        },
        {
          role: 'user',
          content: text
        }
      ]
    });

    return completion.choices[0].message.content || text;
  } catch (error) {
    console.error('Error translating text:', error);
    return text; // Return original text on error
  }
}

/**
 * Enhances audio quality for better transcription
 * Note: This is a simplified implementation. For a production environment,
 * you would integrate with a proper audio processing library or service.
 * @param audioFilePath Path to the audio file
 * @returns Path to enhanced audio file
 */
async function enhanceAudioQuality(audioFilePath: string): Promise<string | null> {
  try {
    const fs = require('fs');
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    // Check if ffmpeg is available
    try {
      await execAsync('which ffmpeg');
    } catch (error) {
      console.warn('ffmpeg not found, skipping audio enhancement');
      return null;
    }
    
    const enhancedFilePath = audioFilePath.replace('.webm', '-enhanced.wav');
    
    // Basic audio processing using ffmpeg
    // - Normalize audio levels
    // - Apply noise reduction
    // - Convert to WAV format (better for transcription)
    await execAsync(
      `ffmpeg -i ${audioFilePath} -af "highpass=f=200,lowpass=f=3000,afftdn=nf=-20" -ar 16000 ${enhancedFilePath}`
    );
    
    if (fs.existsSync(enhancedFilePath)) {
      return enhancedFilePath;
    }
    
    return null;
  } catch (error) {
    console.error('Error enhancing audio:', error);
    return null; // Return null on error, so original file will be used
  }
}

/**
 * Analyzes supplier risk based on provided data
 * @param supplierData Supplier information
 * @returns Risk analysis with score and recommendations
 */
export async function analyzeSupplierRisk(supplierData: Record<string, any>) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured.');
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: 'system',
          content: `You are an expert in supply chain risk assessment. 
          Analyze the supplier data and provide a risk assessment with the following JSON structure:
          {
            "risk_score": (number between 0-100, where 0 is lowest risk and 100 is highest),
            "risk_level": (string, either "Low", "Medium", "High", or "Critical"),
            "key_findings": (array of strings with key risk factors or strengths),
            "recommendations": (array of strings with recommended actions),
            "risk_breakdown": {
              "financial_stability": (number 0-100),
              "supply_reliability": (number 0-100),
              "quality_consistency": (number 0-100),
              "reputation": (number 0-100)
            }
          }`
        },
        {
          role: 'user',
          content: JSON.stringify(supplierData)
        }
      ],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  } catch (error: any) {
    console.error('Error analyzing supplier risk:', error);
    throw new Error(`Failed to analyze supplier risk: ${error.message}`);
  }
}

/**
 * Generate market insights for a specific industry
 * @param industry Industry name or category
 * @returns Market insights with trends, statistics, and opportunities
 */
export async function generateMarketInsights(industry: string) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured.');
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: 'system',
          content: `You are a market research expert. 
          Generate insights about the following industry in JSON format with the following structure:
          {
            "market_size": {
              "value": (string describing current market size),
              "growth_rate": (string describing growth rate)
            },
            "key_trends": (array of strings describing current trends),
            "top_players": (array of objects with "name" and "market_share" fields),
            "opportunities": (array of strings describing opportunities),
            "threats": (array of strings describing threats),
            "forecast": (string with market forecast for next 2-3 years)
          }`
        },
        {
          role: 'user',
          content: `Generate market insights for the ${industry} industry.`
        }
      ],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  } catch (error: any) {
    console.error('Error generating market insights:', error);
    throw new Error(`Failed to generate market insights: ${error.message}`);
  }
}

/**
 * Analyzes an RFQ text and provides recommendations
 * @param rfqText The text of the RFQ to analyze
 * @returns Analysis with categories, potential suppliers, and recommendations
 */
export async function analyzeRFQ(rfqText: string) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured.');
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: 'system',
          content: `You are an expert in analyzing procurement requests. 
          Analyze the provided RFQ (Request for Quotation) text and provide an analysis in JSON format with the following structure:
          {
            "categories": (array of relevant product/service categories),
            "complexity": (string - "Low", "Medium", or "High"),
            "estimated_budget_range": {
              "min": (number - minimum estimated budget),
              "max": (number - maximum estimated budget)
            },
            "key_requirements": (array of strings with key requirements),
            "potential_challenges": (array of strings with potential challenges),
            "supplier_suggestions": (array of strings with types of suppliers that would be good matches),
            "improvement_suggestions": (array of strings with suggestions to improve the RFQ)
          }`
        },
        {
          role: 'user',
          content: rfqText
        }
      ],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  } catch (error: any) {
    console.error('Error analyzing RFQ:', error);
    throw new Error(`Failed to analyze RFQ: ${error.message}`);
  }
}