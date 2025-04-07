import { BodyResponse, ErrorDetail } from '@/common/interfaces/express';
import ErrorCode from '@/common/constants/errorCode';
import { HttpStatusCode } from '@/common/constants';
import BaseException from '../BaseException';
import { Response } from 'express';
import { isArray } from 'lodash';
import logger from '@/common/logger';
import 'express-async-errors';

class BaseExceptionHandler {
  public handleError(error: Error | BaseException, response?: Response): void {
    if (this.isTrustedError(error) && response) {
      this.handleTrustedError(error as BaseException, response);
    } else {
      this.handleUntrustedError(error as Error, response);
    }
  }

  public isTrustedError(error: Error | BaseException): boolean {
    if (error instanceof BaseException) {
      return error.isOperational;
    }
    return false;
  }

  private handleTrustedError(error: BaseException, response: Response): void {
    const statusCode = error.httpCode;
    let errors: ErrorDetail[] = [];
    errors = !isArray(error.errors) ? [error.errors] : error.errors;
    const responseData: BodyResponse = {
      httpStatusCode: statusCode,
      errors,
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    if (statusCode === HttpStatusCode.INTERNAL_SERVER_ERROR) {
      logger.error(errors[0]);
      errors[0].errorMessage = 'Internal Server Error';
    }
    response.status(statusCode).json(responseData);
  }

  private handleUntrustedError(error: Error, response?: Response): void {
    const statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR;

    const errorDetail: ErrorDetail = {
      errorCode: ErrorCode.INTERNAL_ERROR,
      errorMessage: 'Internal server error',
    };
    const responseData: BodyResponse = {
      httpStatusCode: statusCode,
      errors: [errorDetail],
    };
    console.log('error', error);

    logger.error(error);
    if (response) {
      response.status(statusCode).json(responseData);
    }
  }
}

export default new BaseExceptionHandler();
