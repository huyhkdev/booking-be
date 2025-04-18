import { Router } from 'express';
import { adminController } from './AdminController';
import {
  adminMiddleware,
  authMiddleware,
  loginMiddleware,
} from '@/common/middlewares';

export const adminRouter = Router();

// Admin authentication
adminRouter.post('/login', loginMiddleware, adminController.login);

// Owner Management
adminRouter.get(
  '/owners',
  authMiddleware,
  adminMiddleware,
  adminController.getAllOwners
);
adminRouter.get(
  '/owners/:ownerId',
  authMiddleware,
  adminMiddleware,
  adminController.getOwnerById
);

// Owner Request Management
adminRouter.get(
  '/owner-requests',
  authMiddleware,
  adminMiddleware,
  adminController.getAllOwnerRequests
);
adminRouter.get(
  '/owner-requests/:requestId',
  authMiddleware,
  adminMiddleware,
  adminController.getOwnerRequestById
);
adminRouter.put(
  '/owner-requests/accept/:requestId',
  authMiddleware,
  adminController.acceptRequest
);

// User management
adminRouter.get(
  '/users',
  authMiddleware,
  adminMiddleware,
  adminController.getAllUsers
);

adminRouter.post(
  '/users/block',
  authMiddleware,
  adminMiddleware,
  adminController.blockUsers
);
adminRouter.post(
  '/users/un-block',
  authMiddleware,
  adminMiddleware,
  adminController.unblockUsers
);

adminRouter.put(
  '/users/:userId/status',
  authMiddleware,
  adminController.updateUserStatus
);

// Hotel management
adminRouter.get(
  '/hotels',
  authMiddleware,
  adminMiddleware,
  adminController.getAllHotels
);
// adminRouter.put("/hotels/:hotelId/status", adminController.updateHotelStatus);

// Booking management
adminRouter.get(
  '/bookings',
  authMiddleware,
  adminMiddleware,
  adminController.getAllBookings
);

// Review management
adminRouter.get(
  '/reviews',
  authMiddleware,
  adminMiddleware,
  adminController.getAllReviews
);
adminRouter.delete(
  '/reviews/:reviewId',
  authMiddleware,
  adminMiddleware,
  adminController.deleteReview
);

// System statistics
adminRouter.get(
  '/stats',
  authMiddleware,
  adminMiddleware,
  adminController.getSystemStats
);
