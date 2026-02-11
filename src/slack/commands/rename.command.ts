import { Injectable } from '@nestjs/common';
import { TinyTreeCommandContext } from './command.types';
import { SlackMessageUtil } from '../utils/slack-message.util';

@Injectable()
export class RenameCommand {
  constructor(private readonly slackMessage: SlackMessageUtil) {}

  async handle(ctx: TinyTreeCommandContext): Promise<void> {
    if (ctx.subCommand.type !== 'rename') return;

    // ProjectService가 주입되면 여기서 실제 이름 변경 로직을 실행
    // Step 5 (ProjectService 구현) 이후 교체 예정
    await this.slackMessage.postToChannel(
      ctx.channelId,
      `✏️ 이름 변경 기능은 아직 구현 중입니다. (요청된 이름: ${ctx.subCommand.name})`,
    );
  }
}
