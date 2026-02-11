import { Injectable } from '@nestjs/common';
import { TinyTreeCommandContext } from './command.types';
import { SlackMessageUtil } from '../utils/slack-message.util';
import { ProjectService } from '../../project/project.service';

@Injectable()
export class CancelCommand {
  constructor(
    private readonly projectService: ProjectService,
    private readonly slackMessage: SlackMessageUtil,
  ) {}

  async handle(ctx: TinyTreeCommandContext): Promise<void> {
    const cancelled = this.projectService.cancelProject(ctx.userId);
    if (cancelled) {
      await this.slackMessage.postToChannel(
        ctx.channelId,
        '🛑 진행 중인 작업을 취소했습니다.',
      );
    } else {
      await this.slackMessage.postToChannel(
        ctx.channelId,
        '⚠️ 현재 취소할 수 있는 작업이 없습니다.',
      );
    }
  }
}
