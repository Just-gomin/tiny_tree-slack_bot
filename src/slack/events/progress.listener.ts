import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ProgressEvent } from '../../common/events/progress.event';
import { SlackMessageUtil } from '../utils/slack-message.util';

@Injectable()
export class ProgressListener {
  constructor(private readonly slackMessage: SlackMessageUtil) {}

  @OnEvent('progress.send')
  async handleProgressEvent(event: ProgressEvent): Promise<void> {
    await this.slackMessage.postToThread(
      event.channelId,
      event.message,
      event.requestId,
    );

    if (event.details && event.phase) {
      await this.slackMessage.postDetailedToThread(
        event.channelId,
        event.phase,
        event.details,
        event.requestId,
      );
    }
  }
}
