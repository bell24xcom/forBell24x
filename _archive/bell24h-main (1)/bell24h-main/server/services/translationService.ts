import { translate } from '@vitalets/google-translate-api';

export const translateMessage = async (text: string, targetLang: string) => {
  try {
    const result = await translate(text, { to: targetLang });
    return result.text;
  } catch (error) {
    console.error('Translation failed:', error);
    return text;
  }
};
