import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(PrismaClientExceptionFilter.name);

  // https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
  private static mapErrors = new Map<string, HttpStatus>([
    ['P2000', HttpStatus.BAD_REQUEST],
    ['P2002', HttpStatus.CONFLICT],
    ['P2025', HttpStatus.NOT_FOUND],
  ]);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    this.logger.error(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = PrismaClientExceptionFilter.mapErrors.get(exception.code);
    if (statusCode) {
      response.status(statusCode).json({
        statusCode: statusCode,
        message: exception.message,
      });
    } else {
      super.catch(exception, host);
    }
  }
}
