# Tiny Tree Slack Bot - 프로젝트 계획

## 프로젝트 개요

Tiny Tree 시스템의 사용자 인터페이스이자 파이프라인 오케스트레이터입니다.  
Slack을 통해 MVP 생성 요청을 받아 Claude Code CLI를 실행하고, Firebase에 배포하는 전 과정을 관리합니다.

**핵심 역할**:

- Slack 커맨드 수신 및 처리
- Claude API를 통한 계획서 생성
- Claude Code CLI 실행 및 모니터링
- Firebase 배포 관리
- 실시간 진행 상황 알림

## 현재 상태 (Phase 2 진행중)

### ✅ Phase 1 구현 완료

- NestJS 11 + Bolt.js 기반 Slack Bot 구조
- Socket Mode를 통한 Slack 연동 (도메인/ngrok 불필요)
- `/mvp` 커맨드를 통한 MVP 생성 파이프라인
- Claude API 연동 (계획서 생성)
- Claude Code CLI 실행
- Firebase Hosting 배포

### ✅ Phase 2 Week 1-2 완료 (2026-02-11)

- `/tinytree new light/full` 커맨드 파서 재설계
- 커맨드 핸들러 구현 (`new-light`, `new-full`, `cancel`, `status`, `rename`)
- 커맨드 레지스트리 서비스 구현
- 이벤트 핸들러 구현 (`progress.listener.ts`)
- Slack 유틸리티 구현 (`slack-message.util.ts`, `thread-store.ts`)
- 프로젝트 세션 생명주기 구현 (`project-session.ts`, `project.service.ts`)
- 복잡도 자동 계산 → 명시적 모드 선택 방식으로 대체 결정

### 📦 기술 스택

| 구분 | 기술 | 버전 |
| :------: | :------: | :------: |
| Runtime | Node.js | 18+ |
| Framework | NestJS | 11 |
| Slack SDK | @slack/bolt | 최신 |
| AI Engine | Claude Code CLI | 최신 |
| Deployment | Firebase Hosting | - |

## Phase 2: 커맨드 시스템 재설계 (진행중)

### 목표

복잡도 기반 라우팅으로 다양한 프로젝트 규모 지원

### 주요 변경사항

#### 1. 커맨드 체계 변경

**기존**:

``` bash
/mvp [아이디어]
```

**신규**:

``` bash
/tinytree new light [아이디어]  # 간단한 MVP (기능 <5)
/tinytree new full [아이디어]   # 복잡한 프로젝트 (기능 ≥5)
/tinytree cancel                # 작업 중단
/tinytree status                # 진행 상황
/tinytree rename <n>            # 이름 변경
```

#### 2. 프롬프트 관리 시스템 (TypeScript)

**디렉토리 구조**:

```typescript
src/claude/prompts/
├── index.ts                    // 공개 API
├── types.ts                    // 타입 정의
├── builder.ts                  // 프롬프트 조합 로직
├── base/
│   ├── system.prompt.ts        // Claude의 역할 정의
│   └── constraints.prompt.ts   // 전역 제약사항
├── templates/
│   ├── light-planning.prompt.ts
│   ├── light-implementation.prompt.ts
│   ├── full-planning.prompt.ts
│   ├── full-architecture.prompt.ts
│   ├── full-task-breakdown.prompt.ts
│   └── full-implementation.prompt.ts
└── components/
    ├── flutter-best-practices.prompt.ts
    ├── error-handling.prompt.ts
    └── testing-guidelines.prompt.ts
```

**TypeScript로 관리하는 이유**:

- ✅ 타입 안정성 (컴파일 타임 검증)
- ✅ IDE 자동완성 및 리팩토링 지원
- ✅ 템플릿 리터럴로 변수 치환 간편
- ✅ 빌드된 코드에 자동 포함 (별도 복사 불필요)
- ✅ 테스트 및 버전 관리 용이
- ✅ 런타임 파일 I/O 제거 (성능 향상)

**구현 예시**:

```typescript
// src/claude/prompts/types.ts
export interface PromptContext {
  mode: 'light' | 'full';
  idea: string;
  features: string[];
  complexity: {
    score: number;
    features: number;
    screens: number;
    dataModels: number;
    externalAPIs: number;
    stateComplexity: 'simple' | 'medium' | 'complex';
  };
}

export type PromptStage = 
  | 'planning' 
  | 'architecture' 
  | 'task_breakdown' 
  | 'implementation';

// src/claude/prompts/templates/light-planning.prompt.ts
import { PromptContext } from '../types';

export const lightPlanningPrompt = (context: PromptContext): string => `
당신은 Flutter Web 전용 프로토타입을 30분 내에 생성합니다.

사용자 아이디어: ${context.idea}

기능 목록:
${context.features.map(f => `- ${f}`).join('\n')}

제약사항:
- packages/ 폴더 사용 금지
- 모든 코드는 lib/ 아래에 직접 작성
- 상태 관리: setState만 사용
- 화면 수: 최대 3개
- 외부 패키지: http, shared_preferences만 허용
...
`;

// src/claude/prompts/builder.ts
import { PromptContext, PromptStage } from './types';
import { systemPrompt } from './base/system.prompt';
import { globalConstraints } from './base/constraints.prompt';
import { lightPlanningPrompt } from './templates/light-planning.prompt';

export class PromptBuilder {
  constructor(private context: PromptContext) {}
  
  build(stage: PromptStage): string {
    const parts = [
      systemPrompt,
      globalConstraints,
      this.getTemplateForStage(stage),
      flutterBestPractices,
    ];
    return parts.join('\n\n---\n\n');
  }
  
  private getTemplateForStage(stage: PromptStage): string {
    if (this.context.mode === 'light') {
      return stage === 'planning' 
        ? lightPlanningPrompt(this.context)
        : lightImplementationPrompt(this.context);
    } else {
      // full 모드 처리
    }
  }
}

// src/claude/prompts/index.ts - 공개 API
export { PromptBuilder } from './builder';
export type { PromptContext, PromptStage } from './types';

export function createPrompt(
  context: PromptContext, 
  stage: PromptStage
): string {
  const builder = new PromptBuilder(context);
  return builder.build(stage);
}

// 사용 예시 (src/claude/claude.service.ts)
import { createPrompt } from './prompts';

async generatePlan(idea: string, mode: 'light' | 'full') {
  const complexity = this.calculateComplexity(idea);
  
  const prompt = createPrompt({
    mode,
    idea,
    features: this.extractFeatures(idea),
    complexity,
  }, 'planning');
  
  const response = await this.claudeApi.complete(prompt);
  return response;
}
```

#### 3. 복잡도 판단 로직

```typescript
interface ProjectComplexity {
  features: number;
  screens: number;
  dataModels: number;
  externalAPIs: number;
  stateComplexity: 'simple' | 'medium' | 'complex';
}

function calculateComplexityScore(complexity: ProjectComplexity): number {
  return (
    complexity.features * 2 +
    complexity.screens * 1.5 +
    complexity.dataModels +
    complexity.externalAPIs * 3 +
    (complexity.stateComplexity === 'simple' ? 0 : 
     complexity.stateComplexity === 'medium' ? 5 : 10)
  );
}

function determineMode(score: number): 'light' | 'full' {
  return score < 20 ? 'light' : 'full';
}
```

### 구현 작업 목록

#### Week 1-2: 커맨드 파서 재설계

- [x] Slack 커맨드 파서 리팩토링 (2026-02-11)
- [x] `/tinytree new light` 핸들러 구현 (2026-02-11)
- [x] `/tinytree new full` 핸들러 구현 (2026-02-11)
- [x] 스레드 커맨드 인프라 (`/tinytree cancel`, `/tinytree status`, `/tinytree rename`) (2026-02-11)
- [x] 이벤트 핸들러 구현 (`progress.listener.ts`) (2026-02-11)
- [x] Slack 유틸리티 구현 (`slack-message.util.ts`, `thread-store.ts`) (2026-02-11)
- [x] 프로젝트 세션 생명주기 구현 (`project-session.ts`, `project.service.ts`) (2026-02-11)
- ~~복잡도 계산 로직 구현~~ → 커맨드 재설계 시 명시적 모드 선택 방식으로 대체 (불필요)

#### Week 3-4: 프롬프트 시스템 구축 (TypeScript)

- [ ] `src/claude/prompts/` 디렉토리 구조 생성
- [ ] 타입 정의 (`types.ts`)
- [ ] base 프롬프트 작성 (`system.prompt.ts`, `constraints.prompt.ts`)
- [ ] light 모드 템플릿 작성
- [ ] full 모드 템플릿 작성
- [ ] 프롬프트 빌더 구현 (`builder.ts`)
- [ ] 공개 API 구현 (`index.ts`)
- [ ] 단위 테스트 작성

#### Week 5-6: 통합 및 최적화

- [ ] light/full 모드 통합 테스트
- [ ] 에러 처리 강화
- [ ] 로깅 시스템 개선
- [ ] 프롬프트 토큰 사용량 모니터링

## Phase 3: 피드백 시스템 (미정)

### 목표

배포된 앱에 대한 수정 요청 처리

### 계획

- Slack 스레드 기반 피드백 수집
- 변경 범위 분석
- 증분 업데이트

## 아키텍처

### 모듈 구조

```text
src/
├── slack/              # Slack 이벤트/커맨드 핸들링
│   ├── commands/       # 커맨드 핸들러
│   ├── events/         # 이벤트 핸들러
│   └── utils/          # Slack 유틸리티
├── claude/             # Claude 연동
│   ├── api/            # Claude API 클라이언트
│   ├── code/           # Claude Code CLI 실행
│   └── prompts/        # 프롬프트 관리 (TypeScript)
├── firebase/           # Firebase 배포
│   ├── hosting/        # Hosting 배포
│   └── config/         # Firebase 설정
├── project/            # 프로젝트 관리
│   ├── complexity/     # 복잡도 계산
│   └── lifecycle/      # 생명주기 관리
└── common/             # 공통 유틸리티
    ├── logger/         # 로깅
    ├── events/         # 이벤트 버스
    └── config/         # 설정 관리
```

### 실행 흐름

```text
사용자 입력 (/tinytree new light [아이디어])
        ↓
커맨드 파서 (복잡도 분석)
        ↓
프롬프트 생성 (PromptBuilder 사용)
        ↓
Claude API (계획서 작성)
        ↓
계획서 검토 요청 (Slack 메시지)
        ↓
[사용자 승인]
        ↓
Claude Code CLI 실행
        ↓
Firebase 배포
        ↓
배포 URL 전달 (Slack 메시지)
```

## 개발 환경

### 필수 환경 변수

```env
# Slack
SLACK_APP_TOKEN=xapp-...      # Socket Mode용 App-Level Token
SLACK_BOT_TOKEN=xoxb-...      # Bot User OAuth Token
SLACK_SIGNING_SECRET=...      # Signing Secret

# Claude
ANTHROPIC_API_KEY=...         # Claude API Key
CLAUDE_CODE_PATH=...          # Claude Code CLI 경로

# Firebase
FIREBASE_PROJECT_ID=...       # Firebase 프로젝트 ID
FIREBASE_TOKEN=...            # Firebase CI Token

# 프로젝트
TINY_TREE_PATH=...            # App Template 경로
```

### 로컬 개발

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env

# 개발 서버 실행
npm run start:dev
```

## 배포

### GCP VM (e2-micro)

**스펙**:

- vCPU: 0.25-2 (burst)
- RAM: 1GB
- 디스크: 30GB

**제약사항**:

- 메모리 부족 가능성 (Claude Code + Node.js)
- 순차 처리 권장 (동시 실행 제한)

## 문서 링크

- [README.md](../README.md)
- [CLAUDE.md](../CLAUDE.md)

## 관련 프로젝트

- [Tiny Tree App Template](https://github.com/Just-gomin/tiny_tree-app_template)

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
| :------: | :------: | :----------: |
| 2026-02-02 | 1.0 | 프로젝트 계획서 작성 |
| 2026-02-02 | 1.1 | 프롬프트 관리 시스템을 TypeScript로 변경 |
| 2026-02-11 | 1.2 | Phase 2 Week 1-2 완료 반영 (커맨드 파서 재설계, 복잡도 자동 계산 제거) |
