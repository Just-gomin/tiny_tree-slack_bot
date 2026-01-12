import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { spawn } from 'child_process';
import { FirebaseService } from '../firebase/firebase.service';
import { ProgressEvent } from '../common/events/progress.event';

interface MVPResult {
  deployUrl: string;
  projectPath: string;
}

@Injectable()
export class ClaudeService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async generateMVP(idea: string, channelId: string): Promise<MVPResult> {
    const projectName = this.generateProjectName(idea);
    const projectPath = `${process.env.TINY_TREE_PATH}/apps/${projectName}`;

    // Phase 1: 설계
    this.eventEmitter.emit(
      'progress.send',
      new ProgressEvent(channelId, '📋 구현 계획 설계 중...'),
    );
    await this.runClaudeCode(this.buildDesignPrompt(idea, projectPath));

    // Phase 2: 구현
    this.eventEmitter.emit(
      'progress.send',
      new ProgressEvent(channelId, '🔨 MVP 구현 중...'),
    );
    await this.runClaudeCode(this.buildImplementPrompt(projectPath));

    // Phase 3: 빌드
    this.eventEmitter.emit(
      'progress.send',
      new ProgressEvent(channelId, '📦 Flutter Web 빌드 중...'),
    );
    await this.buildFlutterWeb(projectPath);

    // Phase 4: 배포
    this.eventEmitter.emit(
      'progress.send',
      new ProgressEvent(channelId, '🚀 Firebase 배포 중...'),
    );
    const deployUrl = await this.firebaseService.deploy(
      projectPath,
      projectName,
    );

    return { deployUrl, projectPath };
  }

  /**
   * 마크다운 기획서 파일로부터 MVP 생성
   * 기획서에는 더 상세한 요구사항이 포함되어 있으므로 설계 단계를 건너뛰고
   * 바로 구현 단계로 진행
   */
  async generateMVPFromSpec(
    specContent: string,
    channelId: string,
  ): Promise<MVPResult> {
    // 기획서에서 프로젝트명 추출 (첫 번째 # 헤더 사용)
    const projectNameMatch = specContent.match(/^#\s+(.+)$/m);
    const projectTitle = projectNameMatch?.[1] || 'untitled';
    const projectName = this.generateProjectName(projectTitle);
    const projectPath = `${process.env.TINY_TREE_PATH}/apps/${projectName}`;

    this.eventEmitter.emit(
      'progress.send',
      new ProgressEvent(
        channelId,
        `📄 기획서 기반 MVP 생성 시작: "${projectTitle}"`,
      ),
    );

    // Phase 1: 기획서 저장 및 분석
    this.eventEmitter.emit(
      'progress.send',
      new ProgressEvent(channelId, '📋 기획서 분석 중...'),
    );
    await this.runClaudeCode(
      this.buildSpecAnalysisPrompt(specContent, projectPath),
    );

    // Phase 2: 구현
    this.eventEmitter.emit(
      'progress.send',
      new ProgressEvent(channelId, '🔨 MVP 구현 중...'),
    );
    await this.runClaudeCode(this.buildImplementFromSpecPrompt(projectPath));

    // Phase 3: 빌드
    this.eventEmitter.emit(
      'progress.send',
      new ProgressEvent(channelId, '📦 Flutter Web 빌드 중...'),
    );
    await this.buildFlutterWeb(projectPath);

    // Phase 4: 배포
    this.eventEmitter.emit(
      'progress.send',
      new ProgressEvent(channelId, '🚀 Firebase 배포 중...'),
    );
    const deployUrl = await this.firebaseService.deploy(
      projectPath,
      projectName,
    );

    this.eventEmitter.emit(
      'progress.send',
      new ProgressEvent(channelId, `✅ 배포 완료!\n🔗 ${deployUrl}`),
    );

    return { deployUrl, projectPath };
  }

  private async runClaudeCode(prompt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!process.env.CLAUDE_CODE_PATH)
        reject(new Error('Claude Code의 경로를 찾을 수 없습니다.'));

      const claude = spawn(
        process.env.CLAUDE_CODE_PATH!,
        ['--print', '--dangerously-skip-permissions', prompt],
        {
          cwd: process.env.TINY_TREE_PATH,
          timeout: 30 * 60 * 1000, // 30분 타임아웃
        },
      );

      let output = '';
      claude.stdout.on('data', (data) => (output += data));
      claude.stderr.on('data', (data) => console.error(`stderr: ${data}`));

      claude.on('close', (code) => {
        if (code === 0) resolve(output);
        else reject(new Error(`Claude Code 종료 코드: ${code}`));
      });
    });
  }

  private buildDesignPrompt(idea: string, projectPath: string): string {
    return `
다음 아이디어로 Flutter Web MVP를 설계해주세요.
목표: 1시간 내 구현 가능한 최소 기능

아이디어: ${idea}

요구사항:
1. ${projectPath}에 Flutter 프로젝트 생성
2. 핵심 기능 3개 이하로 제한
3. 외부 API 의존성 최소화
4. 단일 화면 또는 최대 3개 화면
5. 로컬 상태만 사용 (서버 불필요)

PLAN.md 파일에 구현 계획을 작성해주세요.
    `.trim();
  }

  private buildImplementPrompt(projectPath: string): string {
    return `
${projectPath}/PLAN.md의 계획을 기반으로 MVP를 구현해주세요.

제약사항:
- Flutter Web 타겟
- Material3 디자인
- 반응형 레이아웃
- 에러 핸들링 포함
- 주석 최소화, 코드 간결하게

구현 후 flutter analyze로 오류가 없는지 확인해주세요.
    `.trim();
  }

  /**
   * 기획서 분석 및 프로젝트 초기화 프롬프트
   */
  private buildSpecAnalysisPrompt(
    specContent: string,
    projectPath: string,
  ): string {
    return `
다음 기획서를 분석하고 Flutter Web MVP 프로젝트를 초기화해주세요.

## 기획서 내용
${specContent}

## 작업 요청
1. ${projectPath}에 Flutter 프로젝트 생성
2. 기획서 내용을 ${projectPath}/SPEC.md로 저장
3. 기획서를 분석하여 1시간 내 구현 가능한 범위로 축소한 계획을 ${projectPath}/PLAN.md에 작성
   - 핵심 기능 3개 이하로 제한
   - 외부 API 의존성 제거
   - 단일 화면 또는 최대 3개 화면
   - 로컬 상태만 사용
4. 구현 불가능한 기능은 PLAN.md에 "향후 구현 예정" 섹션으로 분리

기획서의 의도를 최대한 살리되, 현실적인 MVP 범위를 설정해주세요.
    `.trim();
  }

  /**
   * 기획서 기반 구현 프롬프트
   */
  private buildImplementFromSpecPrompt(projectPath: string): string {
    return `
${projectPath}/PLAN.md와 ${projectPath}/SPEC.md를 참고하여 MVP를 구현해주세요.

## 구현 우선순위
1. PLAN.md에 정의된 핵심 기능 먼저 구현
2. SPEC.md의 디자인 요구사항 반영
3. 사용자 경험을 해치지 않는 범위에서 단순화

## 제약사항
- Flutter Web 타겟
- Material3 디자인
- 반응형 레이아웃 (모바일/데스크톱)
- 에러 핸들링 포함
- SharedPreferences로 로컬 데이터 저장
- 주석 최소화, 코드 간결하게

## 검증
구현 후 다음을 확인해주세요:
1. flutter analyze로 정적 분석 통과
2. 모든 핵심 기능이 동작하는지 확인
3. 빌드 오류 없음 확인
    `.trim();
  }

  private async buildFlutterWeb(projectPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const flutter = spawn('flutter', ['build', 'web', '--release'], {
        cwd: projectPath,
        timeout: 10 * 60 * 1000,
      });

      flutter.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Flutter 빌드 실패: ${code}`));
      });
    });
  }

  private generateProjectName(idea: string): string {
    const timestamp = Date.now();
    const slug = idea
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, '_')
      .substring(0, 20);
    return `mvp_${slug}_${timestamp}`;
  }
}
