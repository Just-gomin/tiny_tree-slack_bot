import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { App } from '@slack/bolt';
import { WebClient } from '@slack/web-api';

/**
 * Bolt.js 앱 인스턴스의 생명주기를 관리
 *
 * 책임:
 * - Socket Mode 앱 초기화 및 시작
 * - ready 상태 추적 (CommandRegistry, SlackMessageUtil에서 waitForReady 호출)
 * - getApp() / getClient() 제공
 *
 * 커맨드 등록, 메시지 전송, 이벤트 수신은 각각 CommandRegistry,
 * SlackMessageUtil, ProgressListener가 담당합니다.
 */
@Injectable()
export class SlackService implements OnModuleInit {
  private readonly logger = new Logger(SlackService.name);
  private readonly app: App;
  private isReady = false;
  private readyPromise: Promise<void>;
  private resolveReady!: () => void;

  constructor() {
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

  getApp(): App {
    return this.app;
  }

  getClient(): WebClient {
    return this.app.client;
  }

  async waitForReady(timeoutMs = 30000): Promise<void> {
    if (this.isReady) return;

    const timeout = new Promise<void>((_, reject) => {
      setTimeout(
        () => reject(new Error('Slack connection timeout')),
        timeoutMs,
      );
    });

    await Promise.race([this.readyPromise, timeout]);
  }
}
