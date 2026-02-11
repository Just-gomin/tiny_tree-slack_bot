import { Injectable } from '@nestjs/common';
import { withRetry } from '../../common/utils/retry';
import { SlackService } from '../slack.service';
import { ThreadStore } from './thread-store';

@Injectable()
export class SlackMessageUtil {
  constructor(
    private readonly slackService: SlackService,
    private readonly threadStore: ThreadStore,
  ) {}

  /**
   * 채널에 새 메시지를 전송하고 thread_ts를 반환
   * requestId를 전달하면 ThreadStore에 thread_ts를 저장
   */
  async postToChannel(
    channel: string,
    message: string,
    requestId?: string,
  ): Promise<string | undefined> {
    await this.slackService.waitForReady();
    const response = await withRetry(async () => {
      return await this.slackService.getClient().chat.postMessage({
        channel,
        text: message,
      });
    });
    const ts = response.ts as string | undefined;
    if (requestId && ts) {
      this.threadStore.set(requestId, ts);
    }
    return ts;
  }

  /**
   * ThreadStore의 thread_ts를 이용해 스레드에 메시지 전송
   * thread_ts가 없으면 채널 최상위 메시지로 전송 후 저장
   */
  async postToThread(
    channel: string,
    message: string,
    requestId: string,
  ): Promise<void> {
    await this.slackService.waitForReady();
    const threadTs = this.threadStore.get(requestId);
    const response = await withRetry(async () => {
      return await this.slackService.getClient().chat.postMessage({
        channel,
        text: message,
        thread_ts: threadTs,
      });
    });
    if (!threadTs && response.ts) {
      this.threadStore.set(requestId, response.ts as string);
    }
  }

  /**
   * Block Kit 형식의 상세 진행 상황을 스레드에 전송
   */
  async postDetailedToThread(
    channel: string,
    phase: string,
    details: Record<string, unknown>,
    requestId: string,
  ): Promise<void> {
    await this.slackService.waitForReady();
    const threadTs = this.threadStore.get(requestId);
    const blocks = [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*${phase}*` },
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
      await this.slackService.getClient().chat.postMessage({
        channel,
        blocks,
        text: phase,
        thread_ts: threadTs,
      });
    });
  }
}
