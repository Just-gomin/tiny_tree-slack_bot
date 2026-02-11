import { Injectable } from '@nestjs/common';
import { TinyTreeCommandContext } from './command.types';
import { SlackMessageUtil } from '../utils/slack-message.util';
import { ProjectService } from '../../project/project.service';

const STATUS_LABELS: Record<string, string> = {
  planning: '📋 계획 수립 중',
  implementing: '🔨 구현 중',
  building: '📦 빌드 중',
  deploying: '🚀 배포 중',
  done: '✅ 완료',
  error: '❌ 오류 발생',
  cancelled: '🛑 취소됨',
};

@Injectable()
export class StatusCommand {
  constructor(
    private readonly projectService: ProjectService,
    private readonly slackMessage: SlackMessageUtil,
  ) {}

  async handle(ctx: TinyTreeCommandContext): Promise<void> {
    const session = this.projectService.getStatus(ctx.userId);

    if (!session) {
      await this.slackMessage.postToChannel(
        ctx.channelId,
        '📋 현재 진행 중인 작업이 없습니다.',
      );
      return;
    }

    const label = STATUS_LABELS[session.status] ?? session.status;
    const elapsed = Math.floor(
      (Date.now() - session.startedAt.getTime()) / 1000,
    );
    await this.slackMessage.postToChannel(
      ctx.channelId,
      `📊 현재 작업 상태\n- 모드: ${session.mode}\n- 아이디어: ${session.idea}\n- 상태: ${label}\n- 경과 시간: ${elapsed}초`,
    );
  }
}
