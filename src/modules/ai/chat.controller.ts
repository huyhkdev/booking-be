import { ResponseCustom } from '@/common/interfaces/express';
import { RequestCustom } from '@/common/types/express';
import { NextFunction } from 'express';
import chatService from './chat.service';
import { HttpStatusCode } from '@/common/constants';

class ChatController {
  async chat(req: RequestCustom, res: ResponseCustom, next: NextFunction) {
    try {
      const { bookingId } = req.params;
      const data = await chatService.generateTravelItinerary(bookingId);
       return res.status(HttpStatusCode.OK).json({
              httpStatusCode: HttpStatusCode.OK,
              data
            });
    } catch (error) {
      next(error);
    }
  }
}
export default new ChatController();
