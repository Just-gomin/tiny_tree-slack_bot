import { Injectable } from '@nestjs/common';
import { SubCommand, TinyTreeCommandContext } from './command.types';

const MODES = ['light', 'full'] as const;

/**
 * `/tinytree` 커맨드 텍스트를 파싱하여 SubCommand로 변환하고,
 * 해당 핸들러로 위임하는 디스패처
 *
 * 파싱 규칙:
 *   "new light <idea>"  → { type: 'new', mode: 'light', idea }
 *   "new full <idea>"   → { type: 'new', mode: 'full', idea }
 *   "new <idea>" (모드 없음) → { type: 'unknown' } → 안내 메시지
 *   "cancel"            → { type: 'cancel' }
 *   "status"            → { type: 'status' }
 *   "rename <name>"     → { type: 'rename', name }
 *   그 외               → { type: 'unknown' }
 */
@Injectable()
export class TinyTreeCommandHandler {
  parseSubCommand(text: string): SubCommand {
    const trimmed = text.trim();
    const tokens = trimmed.split(/\s+/);
    const [first, second, ...rest] = tokens;

    switch (first?.toLowerCase()) {
      case 'new': {
        const mode = second?.toLowerCase();
        if (!MODES.includes(mode as (typeof MODES)[number])) {
          // 모드 없이 "new 아이디어"로 호출한 경우
          return { type: 'unknown', raw: trimmed };
        }
        const idea = rest.join(' ').trim();
        if (!idea) {
          // "new light" (아이디어 없음)
          return { type: 'unknown', raw: trimmed };
        }
        return {
          type: 'new',
          mode: mode as 'light' | 'full',
          idea,
        };
      }

      case 'cancel':
        return { type: 'cancel' };

      case 'status':
        return { type: 'status' };

      case 'rename': {
        const name = tokens.slice(1).join(' ').trim();
        if (!name) {
          return { type: 'unknown', raw: trimmed };
        }
        return { type: 'rename', name };
      }

      default:
        return { type: 'unknown', raw: trimmed };
    }
  }

  buildContext(
    command: { user_id: string; channel_id: string; text: string },
  ): TinyTreeCommandContext {
    return {
      userId: command.user_id,
      channelId: command.channel_id,
      subCommand: this.parseSubCommand(command.text),
      raw: command.text,
    };
  }
}
