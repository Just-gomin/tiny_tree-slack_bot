import { ExceptionFilter, Catch, ArgumentsHost, Logger } from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, _host: ArgumentsHost) {
    const errorMessage =
      exception instanceof Error ? exception.message : 'Unknown error';
    this.logger.error(`Global Exception: ${errorMessage}`, exception instanceof Error ? exception.stack : undefined);
  }
}
