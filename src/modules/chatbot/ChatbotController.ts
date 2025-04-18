import { NextFunction, Request, Response } from 'express';
import { RequestCustom, ResponseCustom } from '@/common/interfaces/express';
import ChatbotService from './ChatbotService';
import { HttpStatusCode } from '@/common/constants';

class ChatbotController {
  async chat(req: RequestCustom, res: ResponseCustom, next: NextFunction) {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({
          httpStatusCode: HttpStatusCode.BAD_REQUEST,
          errors: [{
            errorCode: 'MESSAGE_REQUIRED',
            errorMessage: 'Message is required'
          }]
        });
      }

      const response = await ChatbotService.getChatResponse(message);
      return res.status(200).json({
        httpStatusCode: HttpStatusCode.OK,
        data: { response }
      });
    } catch (error) {
      console.error('Error in chatbot controller:', error);
      next(error);
    }
  }
}

export default new ChatbotController(); 