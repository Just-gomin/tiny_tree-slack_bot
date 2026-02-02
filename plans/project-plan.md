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

## 현재 상태 (Phase 1 완료)

### ✅ 구현 완료

- NestJS 11 + Bolt.js 기반 Slack Bot 구조
- Socket Mode를 통한 Slack 연동 (도메인/ngrok 불필요)
- `/mvp` 커맨드를 통한 MVP 생성 파이프라인
- Claude API 연동 (계획서 생성)
- Claude Code CLI 실행
- Firebase Hosting 배포

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

```text
/mvp [아이디어]
```

**신규**:

```text
/tinytree new light [아이디어]  # 간단한 MVP (기능 <5)
/tinytree new full [아이디어]   # 복잡한 프로젝트 (기능 ≥5)
/tinytree cancel                # 작업 중단
/tinytree status                # 진행 상황
/tinytree rename <name>         # 이름 변경
```

#### 2. 프롬프트 관리 시스템

**디렉토리 구조**:

```text
prompts/
├── base/                       # 기본 시스템 프롬프트
│   ├── system.md              # Claude의 역할
│   └── constraints.md         # 전역 제약사항
├── modes/                      # 모드별 프롬프트
│   ├── light/
│   │   ├── planning.md
│   │   └── implementation.md
│   └── full/
│       ├── planning.md
│       ├── architecture.md
│       ├── task_breakdown.md
│       └── implementation.md
└── components/                 # 재사용 프롬프트
    ├── flutter_best_practices.md
    ├── error_handling.md
    └── testing_guidelines.md
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

- [ ] Slack 커맨드 파서 리팩토링
- [ ] `/tinytree new light` 핸들러 구현
- [ ] `/tinytree new full` 핸들러 구현
- [ ] 스레드 커맨드 인프라 (`/tinytree cancel`, `/tinytree status` 등)
- [ ] 복잡도 계산 로직 구현

#### Week 3-4: 프롬프트 시스템 구축

- [ ] `prompts/` 디렉토리 구조 생성
- [ ] base 프롬프트 작성 (system.md, constraints.md)
- [ ] light 모드 프롬프트 작성
- [ ] full 모드 프롬프트 작성
- [ ] 프롬프트 템플릿 엔진 구현

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
│   └── prompts/        # 프롬프트 관리
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
프롬프트 생성 (light 또는 full)
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
| :------: | :------: | :---------- |
| 2025-02-02 | 1.0 | 프로젝트 계획서 작성 |
