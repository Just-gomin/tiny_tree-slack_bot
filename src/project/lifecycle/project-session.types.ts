import { ChildProcess } from 'child_process';

export type ProjectMode = 'light' | 'full';

export type ProjectStatus =
  | 'planning'
  | 'implementing'
  | 'building'
  | 'deploying'
  | 'done'
  | 'error'
  | 'cancelled';

/**
 * 진행 중인 프로젝트 생성 작업의 상태 스냅샷
 *
 * processRef: cancel 요청 시 SIGTERM/SIGKILL을 보내기 위해 보관
 */
export interface ProjectSession {
  requestId: string;
  userId: string;
  channelId: string;
  mode: ProjectMode;
  idea: string;
  status: ProjectStatus;
  startedAt: Date;
  processRef?: ChildProcess;
}
