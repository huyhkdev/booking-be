import config from '@/common/config';
import BaseExceptionHandler from '@/common/exception/handler/BaseExceptionHandler';
import logger from '@/common/logger';
import router from '@/routes/routes';
import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { connectDatabase } from './databases';
import StripeController from './modules/Stripe/StripeController';
export class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
    this.errorHandler();
  }
  private middlewares() {
    this.app.use(cors());
    this.app.use(helmet());
    this.app.post(
      '/api/v1/webhook',
      express.raw({ type: 'application/json' }),
      StripeController.enventByStripe
    );
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private routes() {
    this.app.use(config.contextPath, router);
  }

  private errorHandler() {
    this.app.use(
      (error: Error, _req: Request, res: Response, _next: NextFunction) => {
        BaseExceptionHandler.handleError(error, res);
      }
    );
  }

  public listen() {
    try {
      const HOST = config.hostServer;
      const PORT = config.portServer;
      void connectDatabase();
      this.app.listen(PORT, () => {
        logger.info(
          `Server running at http://${HOST}:${PORT}${config.contextPath}`
        );
      });
    } catch (error) {
      logger.error(error);
    }
  }
}

export default new App();
