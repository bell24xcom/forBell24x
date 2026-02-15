import OpenAI from 'openai';

export class AICategoryService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async generateCategorySuggestions(industry: string, count: number = 5): Promise<string[]> {
    try {
      const prompt = `Generate ${count} relevant business categories for the ${industry} industry. 
      Return only the category names, one per line, without any additional text or numbering.`;
      
      const response = await this.openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-3.5-turbo',
      });

      const suggestions = response.choices[0].message.content
        .split('\n')
        .filter(Boolean)
        .slice(0, count);

      return suggestions;
    } catch (error) {
      console.error('Error generating category suggestions:', error);
      throw new Error('Failed to generate category suggestions');
    }
  }

  async generateCategoryPageContent(category: string): Promise<string> {
    try {
      const prompt = `Generate SEO-optimized content for a business category page about ${category}. 
      Include a compelling title, meta description, and main content with relevant keywords. 
      Format the response as a JSON object with 'title', 'metaDescription', and 'content' fields.`;
      
      const response = await this.openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-3.5-turbo',
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error generating category page content:', error);
      throw new Error('Failed to generate category page content');
    }
  }
} 