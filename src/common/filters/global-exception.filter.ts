import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { SlackService } from '../../slack/slack.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly slackService: SlackService) { }

  async catch(exception: unknown, host: ArgumentsHost) {
    const errorMessage =
      exception instanceof Error ? exception.message : 'Unknown error';

    // 에러 로그 저장
    console.error('Global Exception:', exception);

    // 관리자 채널에 에러 알림 (선택적)
    await this.slackService.sendProgress('#errors', `🚨 ${errorMessage}`);
  }
}
