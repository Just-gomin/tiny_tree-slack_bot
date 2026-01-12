import { Module } from '@nestjs/common';
import { SlackService } from './slack.service';
import { ClaudeModule } from '../claude/claude.module';

@Module({
  imports: [ClaudeModule],
  providers: [SlackService],
  exports: [SlackService],
})
export class SlackModule {}
