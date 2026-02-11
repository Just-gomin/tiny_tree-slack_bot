import { Injectable, Logger } from '@nestjs/common';
import { TinyTreeCommandContext } from './command.types';
import { SlackMessageUtil } from '../utils/slack-message.util';
import { ProjectSessionStore } from '../../project/lifecycle/project-session';
import { ProjectService } from '../../project/project.service';

@Injectable()
export class NewLightCommand {
  private readonly logger = new Logger(NewLightCommand.name);

  constructor(
    private readonly projectService: ProjectService,
    private readonly sessionStore: ProjectSessionStore,
    private readonly slackMessage: SlackMessageUtil,
  ) {}

  async handle(ctx: TinyTreeCommandContext): Promise<void> {
    if (ctx.subCommand.type !== 'new') return;

    const { userId, channelId } = ctx;
    const { idea } = ctx.subCommand;

    if (this.sessionStore.isUserBusy(userId)) {
      await this.slackMessage.postToChannel(
        channelId,
        '⚠️ 이미 작업이 진행 중입니다. `/tinytree status`로 확인하거나 `/tinytree cancel`로 취소해주세요.',
      );
      return;
    }

    const requestId = `${userId}_${Date.now()}`;

    this.sessionStore.create({
      requestId,
      userId,
      channelId,
      mode: 'light',
      idea,
      status: 'planning',
    });

    await this.slackMessage.postToChannel(
      channelId,
      `🌱 MVP 생성을 시작합니다. (light 모드)\n- 아이디어: ${idea}`,
      requestId,
    );

    try {
      const result = await this.projectService.generateLight(
        idea,
        channelId,
        requestId,
      );
      const projectName = result.projectPath.split('/').pop();
      await this.slackMessage.postToThread(
        channelId,
        `✅ 배포 완료!\n🔗 URL: ${result.deployUrl}\n📁 프로젝트: ${projectName}`,
        requestId,
      );
      this.sessionStore.updateStatus(requestId, 'done');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`light 모드 생성 실패: ${message}`);
      await this.slackMessage.postToThread(
        channelId,
        `❌ 오류 발생: ${message}`,
        requestId,
      );
      this.sessionStore.updateStatus(requestId, 'error');
    } finally {
      this.sessionStore.deleteByUserId(userId);
    }
  }
}
