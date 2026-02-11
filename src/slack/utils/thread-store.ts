import { Injectable } from '@nestjs/common';

/**
 * Slack 스레드 타임스탬프(thread_ts)를 requestId 기준으로 관리
 *
 * 스레드에 후속 메시지를 전송할 때 thread_ts가 필요하므로,
 * 초기 메시지 전송 후 ts를 저장하고 이후 메시지에서 조회합니다.
 */
@Injectable()
export class ThreadStore {
  private readonly store = new Map<string, string>();

  set(requestId: string, ts: string): void {
    this.store.set(requestId, ts);
  }

  get(requestId: string): string | undefined {
    return this.store.get(requestId);
  }

  delete(requestId: string): void {
    this.store.delete(requestId);
  }
}
