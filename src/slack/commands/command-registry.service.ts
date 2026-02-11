import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SlackService } from '../slack.service';
import { TinyTreeCommandHandler } from './tinytree-command.handler';
import { NewLightCommand } from './new-light.command';
import { NewFullCommand } from './new-full.command';
import { CancelCommand } from './cancel.command';
import { StatusCommand } from './status.command';
import { RenameCommand } from './rename.command';
import { SlackMessageUtil } from '../utils/slack-message.util';
import { TinyTreeCommandContext } from './command.types';

/**
 * Bolt.js에 모든 슬래시 커맨드를 등록하는 조율자
 *
 * 각 커맨드 핸들러를 주입받아 app.command()에 등록합니다.
 * /mvp 레거시 커맨드는 Deprecated Forwarding 패턴으로 new-light로 위임합니다.
 */
@Injectable()
export class CommandRegistryService implements OnModuleInit {
  private readonly logger = new Logger(CommandRegistryService.name);

  constructor(
    private readonly slackService: SlackService,
    private readonly handler: TinyTreeCommandHandler,
    private readonly newLightCommand: NewLightCommand,
    private readonly newFullCommand: NewFullCommand,
    private readonly cancelCommand: CancelCommand,
    private readonly statusCommand: StatusCommand,
    private readonly renameCommand: RenameCommand,
    private readonly slackMessage: SlackMessageUtil,
  ) {}

  onModuleInit() {
    this.registerTinyTree();
    this.registerLegacyMvp();
    this.logger.log('커맨드 등록 완료');
  }

  private registerTinyTree() {
    this.slackService.getApp().command(
      '/tinytree',
      async ({ command, ack }) => {
        await ack();

        const ctx = this.handler.buildContext(command);

        switch (ctx.subCommand.type) {
          case 'new':
            if (ctx.subCommand.mode === 'light') {
              await this.newLightCommand.handle(ctx);
            } else {
              await this.newFullCommand.handle(ctx);
            }
            break;

          case 'cancel':
            await this.cancelCommand.handle(ctx);
            break;

          case 'status':
            await this.statusCommand.handle(ctx);
            break;

          case 'rename':
            await this.renameCommand.handle(ctx);
            break;

          case 'unknown':
            await this.sendUnknownGuide(ctx);
            break;
        }
      },
    );
  }

  /**
   * /mvp 레거시 커맨드 — /tinytree new light로 포워딩
   * Slack 앱 설정에서 /tinytree가 안정화되면 이 핸들러를 제거합니다.
   */
  private registerLegacyMvp() {
    this.slackService.getApp().command(
      '/mvp',
      async ({ command, ack }) => {
        await ack();

        await this.slackMessage.postToChannel(
          command.channel_id,
          'ℹ️ `/mvp` 커맨드는 곧 종료됩니다. `/tinytree new light [아이디어]`를 사용해주세요.',
        );

        const ctx: TinyTreeCommandContext = {
          userId: command.user_id,
          channelId: command.channel_id,
          subCommand: {
            type: 'new',
            mode: 'light',
            idea: command.text || '아이디어 없음',
          },
          raw: command.text,
        };

        await this.newLightCommand.handle(ctx);
      },
    );
  }

  private async sendUnknownGuide(ctx: TinyTreeCommandContext): Promise<void> {
    const text = ctx.subCommand.type === 'unknown' ? ctx.subCommand.raw : '';
    const isNewWithoutMode =
      text.trim().toLowerCase().startsWith('new ') &&
      !text.trim().toLowerCase().startsWith('new light') &&
      !text.trim().toLowerCase().startsWith('new full');

    const message = isNewWithoutMode
      ? `❓ 모드를 지정해주세요.\n\`/tinytree new light [아이디어]\` — 간단한 MVP (30분~1시간)\n\`/tinytree new full [아이디어]\` — 복잡한 프로젝트 (2~4시간)`
      : `❓ 사용법:\n\`/tinytree new light [아이디어]\`\n\`/tinytree new full [아이디어]\`\n\`/tinytree status\`\n\`/tinytree cancel\`\n\`/tinytree rename [이름]\``;

    await this.slackMessage.postToChannel(ctx.channelId, message);
  }
}
