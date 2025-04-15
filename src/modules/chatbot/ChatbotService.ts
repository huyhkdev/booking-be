import axios from 'axios';
import config from '@/common/config/config';

class ChatbotService {
  private readonly GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

  async getChatResponse(message: string) {
    try {
      const response = await axios.post(
        this.GROK_API_URL,
        {
          model: "grok-3-latest",
          messages: [
            {
              role: "system",
              content: "You are a helpful hotel booking assistant. You can help users with hotel bookings, room information, and general inquiries about hotels."
            },
            {
              role: "user",
              content: message
            }
          ],
          temperature: 0.7,
          max_tokens: 150
        },
        {
          headers: {
            'Authorization': `Bearer ${config.grokApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message?.content || "I'm sorry, I couldn't process your request.";
    } catch (error) {
      console.error('Error in chatbot service:', error);
      throw error;
    }
  }
}

export default new ChatbotService(); 