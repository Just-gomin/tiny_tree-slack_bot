# Tiny Tree Slack Bot

AI를 활용한 MVP 자동화 시스템 Tiny Tree의 Slack Bot 프로젝트입니다.

Slack을 통해 아이디어나 기획서를 입력받아 [Tiny Tree App Template](https://github.com/Just-gomin/tiny_tree-app_template) 프로젝트와 연동하여 MVP를 자동 생성하고 배포합니다.

## 목표

- Slack 인터페이스를 통한 MVP 생성 요청 수신
- Claude Code CLI를 활용한 자동화된 설계/구현/배포 파이프라인 실행
- 실시간 진행 상황 알림 제공

## 기술 스택

| 구분 | 기술 |
| :------: | :-------: |
| Runtime | Node.js 18+ |
| Framework | NestJS 11 |
| Slack SDK | @slack/bolt, @slack/web-api |
| AI Engine | Claude Code CLI |
| Deployment | Firebase Hosting |

## 프로젝트 구조

```text
src/
├── main.ts                 # 애플리케이션 진입점
├── app.module.ts           # 루트 모듈
│
├── slack/                  # Slack 연동 모듈
│   ├── slack.module.ts
│   └── slack.service.ts    # Slack 이벤트/커맨드 핸들링
│
├── claude/                 # Claude Code 실행 모듈
│   ├── claude.module.ts
│   └── claude.service.ts   # Claude Code CLI 실행 및 프롬프트 관리
│
├── firebase/               # Firebase 배포 모듈
│   ├── firebase.module.ts
│   └── firebase.service.ts # Firebase Hosting 배포
│
├── common/                 # 공통 유틸리티
│   ├── common.module.ts
│   ├── logger.service.ts   # 로깅 서비스
│   ├── events/             # 이벤트 정의
│   ├── filters/            # 예외 필터
│   └── utils/              # 유틸리티 함수
│
└── config/                 # 환경 설정
    └── env.validation.ts   # 환경 변수 검증
```

## 핵심 모듈

### Slack Module

- Socket Mode 기반 연결 (도메인/ngrok 불필요)
- `/mvp` 슬래시 커맨드 처리
- 마크다운 기획서 파일 업로드 처리
- 실시간 진행 상황 알림

### Claude Module

- Claude Code CLI 프로세스 실행
- 아이디어 기반 설계 프롬프트 생성
- 기획서 기반 분석 프롬프트 생성
- 구현 프롬프트 생성

### Firebase Module

- Firebase Hosting 자동 배포
- 동적 사이트 생성
- 배포 URL 반환

## 환경 설정

### 필수 환경 변수

```env
# Slack 설정
SLACK_APP_TOKEN=xapp-...      # Socket Mode용 App-Level Token
SLACK_BOT_TOKEN=xoxb-...      # Bot User OAuth Token
SLACK_SIGNING_SECRET=...      # Signing Secret

# Claude Code 설정
CLAUDE_CODE_PATH=/usr/local/bin/claude

# 프로젝트 경로
TINY_TREE_PATH=/path/to/tiny_tree-app_template

# Firebase 설정
FIREBASE_PROJECT_ID=your-project-id
```

### Slack App 설정

1. [Slack API](https://api.slack.com/apps)에서 앱 생성
2. Socket Mode 활성화 → App-Level Token 생성
3. Bot Token Scopes 추가:
   - `chat:write`, `commands`, `app_mentions:read`
   - `channels:history`, `channels:read`, `files:read`
4. Slash Commands에서 `/mvp` 등록
5. Event Subscriptions에서 `file_shared` 이벤트 구독

## 실행 방법

### 개발 환경

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일 편집

# 개발 서버 실행
npm run start:dev
```

### 프로덕션 환경

```bash
# 빌드
npm run build

# 실행
npm run start:prod
```

## 사용 방법

### 슬래시 커맨드

```text
/mvp 간단한 투두 리스트 앱
```

### 기획서 업로드

마크다운(`.md`) 파일을 Slack 채널에 업로드하면 자동으로 MVP 생성이 시작됩니다.

## MVP 생성 플로우

```text
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Slack 입력  │────▶│  계획 설계   │────▶│  MVP 구현   │────▶│ Firebase    │
│  (아이디어)  │     │ (Claude)    │     │ (Claude)    │     │  배포       │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                   │
                                                                   ▼
                                              ┌─────────────────────────────┐
                                              │  Slack으로 배포 URL 전달    │
                                              └─────────────────────────────┘
```

## 고도화 계획

### Task Queue 시스템

- 동시 다발적인 MVP 생성 요청 처리
- 작업 우선순위 관리
- 실패한 작업 재시도 로직

### 대화형 수정 기능

- 배포된 MVP에 대한 피드백 수집
- Slack 스레드를 통한 수정 요청 처리
- 반복적인 개선 사이클 지원

### 모니터링 및 알림

- 작업 성공/실패 통계
- 에러 알림 채널 연동
- 배포 히스토리 관리

### 다중 템플릿 지원

- React/Next.js 템플릿 추가
- 템플릿 선택 옵션 제공

## 관련 프로젝트

- [Tiny Tree App Template](https://github.com/Just-gomin/tiny_tree-app_template) - Flutter MVP 템플릿

## 라이선스

MIT License
