import { NextFunction, Request, Response } from 'express';
import reviewService from './reviewService';
import { RequestCustom, ResponseCustom } from '@/common/interfaces/express';
import { HttpStatusCode } from '@/common/constants';
import ReviewService from './ReviewService';

class ReviewController {

  async createReview(request: RequestCustom, response: ResponseCustom, next: NextFunction) {
    try {
      const { bookingId } = request.params;
      const { uid } = request.userInfo;
      const { reviewRating, reviewContent } = request.body;
      console.log(request.body)
      reviewService.createReview(uid, bookingId, reviewRating, reviewContent);

      return response.status(HttpStatusCode.OK).json({
        httpStatusCode: HttpStatusCode.OK,
      });
    } catch (error) {
      next(error);
    }
  }

  async getReviewsByOwner(req: RequestCustom, res: ResponseCustom, next: NextFunction) {
    try {
      const { uid } = req.userInfo;
      const data = await ReviewService.getReviewsByOwner(uid);
      return res.status(200).json({
        httpStatusCode: HttpStatusCode.OK,
        data
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

}
export default new ReviewController();
