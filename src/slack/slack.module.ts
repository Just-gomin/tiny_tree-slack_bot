import { Module } from '@nestjs/common';
import { ProjectModule } from '../project/project.module';
import { SlackService } from './slack.service';
import { CommandRegistryService } from './commands/command-registry.service';
import { TinyTreeCommandHandler } from './commands/tinytree-command.handler';
import { NewLightCommand } from './commands/new-light.command';
import { NewFullCommand } from './commands/new-full.command';
import { CancelCommand } from './commands/cancel.command';
import { StatusCommand } from './commands/status.command';
import { RenameCommand } from './commands/rename.command';
import { ProgressListener } from './events/progress.listener';
import { SlackMessageUtil } from './utils/slack-message.util';
import { ThreadStore } from './utils/thread-store';

@Module({
  imports: [ProjectModule],
  providers: [
    SlackService,
    ThreadStore,
    SlackMessageUtil,
    ProgressListener,
    TinyTreeCommandHandler,
    NewLightCommand,
    NewFullCommand,
    CancelCommand,
    StatusCommand,
    RenameCommand,
    CommandRegistryService,
  ],
  exports: [SlackService],
})
export class SlackModule {}
