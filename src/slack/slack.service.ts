import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { App } from '@slack/bolt';
import { ClaudeService } from '../claude/claude.service';
import { ProgressEvent } from '../common/events/progress.event';
import { withRetry } from '../common/utils/retry';

@Injectable()
export class SlackService implements OnModuleInit {
  private readonly logger = new Logger(SlackService.name);
  private app: App;
  private isReady = false;
  private readyPromise: Promise<void>;
  private resolveReady: () => void;
  // 사용자별 활성 요청 추적 (동시 요청 방지)
  private activeRequests = new Map<string, boolean>();

  constructor(private readonly claudeService: ClaudeService) {
    this.readyPromise = new Promise((resolve) => {
      this.resolveReady = resolve;
    });

    this.app = new App({
      token: process.env.SLACK_BOT_TOKEN,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      socketMode: true,
      appToken: process.env.SLACK_APP_TOKEN,
    });
  }

  async onModuleInit() {
    this.registerHandlers();

    try {
      await this.app.start();
      this.isReady = true;
      this.resolveReady();
      this.logger.log('⚡️ Slack Bot 시작됨');
    } catch (error) {
      this.logger.error('Slack Bot 시작 실패:', error);
      throw error;
    }
  }

  private async waitForReady(timeoutMs = 30000): Promise<void> {
    if (this.isReady) {
      return;
    }

    const timeout = new Promise<void>((_, reject) => {
      setTimeout(
        () => reject(new Error('Slack connection timeout')),
        timeoutMs,
      );
    });

    await Promise.race([this.readyPromise, timeout]);
  }

  private registerHandlers() {
    // MVP 생성 명령어
    this.app.command('/mvp', async ({ command, ack, say }) => {
      await ack();

      const userId = command.user_id;
      const idea = command.text;

      // 동시 요청 체크
      if (this.activeRequests.get(userId)) {
        await say('⚠️ 이미 MVP 생성 중입니다. 완료될 때까지 기다려주세요.');
        return;
      }

      // 요청 시작
      this.activeRequests.set(userId, true);
      await say(`🌱 MVP 생성을 시작합니다: "${idea}"`);

      try {
        const result = await this.claudeService.generateMVP(
          idea,
          command.channel_id,
        );
        await say(`✅ 배포 완료!\n🔗 ${result.deployUrl}`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        await say(`❌ 오류 발생: ${errorMessage}`);
      } finally {
        // 요청 완료 (반드시 정리)
        this.activeRequests.delete(userId);
      }
    });

    // 기획서 파일 업로드 처리
    this.app.event('file_shared', async ({ event, client }) => {
      const file = await client.files.info({ file: event.file_id });
      if (
        file.file?.mimetype === 'text/markdown' ||
        file.file?.name?.endsWith('.md')
      ) {
        if (!file.file.url_private) {
          throw Error();
        }

        const content = await this.downloadFile(file.file.url_private);
        await this.claudeService.generateMVPFromSpec(content, event.channel_id);
      }
    });
  }

  async sendProgress(channel: string, message: string) {
    await this.waitForReady();

    await withRetry(async () => {
      await this.app.client.chat.postMessage({
        channel,
        text: message,
      });
    });
  }

  private async downloadFile(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` },
    });
    return response.text();
  }

  // 상세한 진행 상황 전송
  async sendDetailedProgress(channel: string, phase: string, details: object) {
    await this.waitForReady();

    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${phase}*`,
        },
      },
      {
        type: 'context',
        elements: Object.entries(details).map(([key, value]) => ({
          type: 'mrkdwn',
          text: `*${key}:* ${value}`,
        })),
      },
    ];

    await withRetry(async () => {
      await this.app.client.chat.postMessage({
        channel,
        blocks,
        text: phase,
      });
    });
  }

  // 진행 상황 이벤트 리스너
  @OnEvent('progress.send')
  async handleProgressEvent(event: ProgressEvent) {
    await this.sendProgress(event.channelId, event.message);

    if (event.details && event.phase) {
      await this.sendDetailedProgress(
        event.channelId,
        event.phase,
        event.details,
      );
    }
  }
}
