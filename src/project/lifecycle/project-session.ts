import { Injectable } from '@nestjs/common';
import { ProjectSession, ProjectStatus } from './project-session.types';

/**
 * 진행 중인 프로젝트 세션을 userId 기준으로 관리
 *
 * 메모리 기반 저장소 — 서버 재시작 시 세션이 초기화됩니다.
 * GCP e2-micro 환경에서는 허용 가능한 트레이드오프이며,
 * 향후 Redis 도입으로 영속성을 확보할 수 있습니다.
 */
@Injectable()
export class ProjectSessionStore {
  private readonly sessions = new Map<string, ProjectSession>();

  create(session: Omit<ProjectSession, 'startedAt'>): ProjectSession {
    const fullSession: ProjectSession = {
      ...session,
      startedAt: new Date(),
    };
    this.sessions.set(session.userId, fullSession);
    return fullSession;
  }

  findByUserId(userId: string): ProjectSession | undefined {
    return this.sessions.get(userId);
  }

  findByRequestId(requestId: string): ProjectSession | undefined {
    for (const session of this.sessions.values()) {
      if (session.requestId === requestId) return session;
    }
    return undefined;
  }

  update(requestId: string, patch: Partial<Omit<ProjectSession, 'requestId'>>): void {
    const session = this.findByRequestId(requestId);
    if (!session) return;
    Object.assign(session, patch);
  }

  updateStatus(requestId: string, status: ProjectStatus): void {
    this.update(requestId, { status });
  }

  deleteByUserId(userId: string): void {
    this.sessions.delete(userId);
  }

  isUserBusy(userId: string): boolean {
    const session = this.sessions.get(userId);
    if (!session) return false;
    return !['done', 'error', 'cancelled'].includes(session.status);
  }
}
