import { Injectable, Logger } from '@nestjs/common';
import { ClaudeService } from '../claude/claude.service';
import { ProjectSessionStore } from './lifecycle/project-session';

export interface ProjectResult {
  deployUrl: string;
  projectPath: string;
}

/**
 * 프로젝트 생성 파이프라인을 오케스트레이션
 *
 * 현재는 ClaudeService.generateMVP()에 위임합니다.
 * Week 3-4 프롬프트 시스템 구축 이후 light/full 모드별
 * PromptBuilder를 사용하여 프롬프트를 다르게 구성할 예정입니다.
 */
@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(
    private readonly claudeService: ClaudeService,
    private readonly sessionStore: ProjectSessionStore,
  ) {}

  async generateLight(
    idea: string,
    channelId: string,
    requestId: string,
  ): Promise<ProjectResult> {
    this.logger.log(`light 모드 생성 시작: "${idea}"`);
    this.sessionStore.updateStatus(requestId, 'planning');
    return this.claudeService.generateMVP(idea, channelId, requestId);
  }

  async generateFull(
    idea: string,
    channelId: string,
    requestId: string,
  ): Promise<ProjectResult> {
    this.logger.log(`full 모드 생성 시작: "${idea}"`);
    this.sessionStore.updateStatus(requestId, 'planning');
    // TODO(future): full 모드 전용 프롬프트 적용 (Week 3-4)
    return this.claudeService.generateMVP(idea, channelId, requestId);
  }

  cancelProject(userId: string): boolean {
    const session = this.sessionStore.findByUserId(userId);
    if (!session?.processRef) return false;

    session.processRef.kill('SIGTERM');
    setTimeout(() => {
      if (!session.processRef?.killed) {
        session.processRef?.kill('SIGKILL');
      }
    }, 5000);

    this.sessionStore.updateStatus(session.requestId, 'cancelled');
    return true;
  }

  getStatus(userId: string) {
    return this.sessionStore.findByUserId(userId);
  }
}
