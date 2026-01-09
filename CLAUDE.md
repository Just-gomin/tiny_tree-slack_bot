# CLAUDE.md

## Answering Request

- Please answer in korean.

## Project Overview

- NestJS 11 기반 Slack Bot 프로젝트
- TypeScript 5.7, ES modules (nodenext) 사용
- Slack Bolt SDK 통합 예정
- Jest 테스트 프레임워크

## Project Structure

### 디렉토리 구조

- `src/`: 소스 코드 디렉토리
  - `*.module.ts`: NestJS 모듈 파일
  - `*.controller.ts`: 컨트롤러 파일
  - `*.service.ts`: 서비스 파일
  - `*.spec.ts`: 단위 테스트 파일
  - `main.ts`: 애플리케이션 진입점
- `test/`: E2E 테스트 디렉토리
  - `*.e2e-spec.ts`: E2E 테스트 파일
  - `jest-e2e.json`: E2E Jest 설정
- `dist/`: 빌드 출력 디렉토리 (git에서 제외됨)

### 향후 Slack 모듈 구조 예시

```text
src/
├── app.module.ts          # 루트 모듈
├── slack/                 # Slack 관련 기능
│   ├── slack.module.ts    # Slack 모듈
│   ├── events/            # 이벤트 핸들러
│   ├── commands/          # 슬래시 커맨드
│   └── services/          # Slack 관련 서비스
└── config/                # 설정 모듈
    └── config.module.ts
```

## NestJS Architecture

### 모듈 기반 구조

- Slack 이벤트/명령어를 기능별 NestJS 모듈로 구조화
- 각 기능은 독립적인 모듈로 분리
- 모듈 간 의존성은 최소화
- 공통 기능은 shared 모듈로 추출

### 모듈 설계 원칙

- **독립성**: 각 모듈은 독립적으로 동작 가능
- **최소 의존성**: 모듈 간 의존성을 최소화하여 유지보수성 향상
- **공통 기능 분리**: 여러 모듈에서 사용되는 기능은 shared 모듈로 분리

## Environment Variables

### @nestjs/config 사용

- `@nestjs/config` 패키지를 통한 환경 변수 관리
- `.env` 파일 사용 (git에서 제외, `.env.example` 제공)

### 필수 환경 변수

**Slack 관련:**

- `SLACK_BOT_TOKEN`: Bot User OAuth Token
- `SLACK_SIGNING_SECRET`: Signing Secret
- `SLACK_APP_TOKEN`: App-Level Token (Socket Mode 사용 시)

**애플리케이션:**

- `PORT`: 서버 포트 (기본값: 3000)
- `NODE_ENV`: 실행 환경 (development, production)

### ConfigModule 설정 예시

```typescript
// config/config.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
})
export class AppConfigModule {}
```

## Bash commands

### Development

- `npm run start`: 프로덕션 모드로 애플리케이션 시작
- `npm run start:dev`: watch 모드로 개발 서버 시작
- `npm run start:debug`: 디버그 모드로 개발 서버 시작
- `npm run start:prod`: 빌드된 애플리케이션 실행 (dist/main.js)

### Build

- `npm run build`: 프로젝트 빌드 (dist/ 디렉토리에 출력)
- `npm run typecheck`: TypeScript 타입 체크

### Test Commands

- `npm test`: 단위 테스트 실행
- `npm run test:watch`: watch 모드로 단위 테스트 실행
- `npm run test:cov`: 코드 커버리지와 함께 테스트 실행
- `npm run test:debug`: 디버그 모드로 테스트 실행
- `npm run test:e2e`: E2E 테스트 실행

### Code Quality

- `npm run lint`: ESLint 실행 및 자동 수정
- `npm run format`: Prettier로 코드 포맷팅

## Code style

### Module System

- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (eg. `import { foo } from 'bar'`)

### Prettier Configuration

- `singleQuote: true`: 작은따옴표 사용
- `trailingComma: 'all'`: 가능한 모든 곳에 trailing comma 사용

### TypeScript

- Decorators 사용 (`experimentalDecorators: true`)
- Strict null checks 활성화 (`strictNullChecks: true`)
- ES2023 타겟

## Testing

### 단위 테스트 (Unit Tests)

**파일 위치:** `src/**/*.spec.ts`

**Jest 설정:**

- `rootDir: "src"`
- `testRegex: ".*\\.spec\\.ts$"`

**테스트 구조:**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ServiceName } from './service-name.service';

describe('ServiceName', () => {
  let service: ServiceName;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceName],
    }).compile();

    service = module.get<ServiceName>(ServiceName);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### E2E 테스트 (End-to-End Tests)

**파일 위치:** `test/**/*.e2e-spec.ts`

**특징:**

- 전체 애플리케이션 통합 테스트
- supertest를 사용한 HTTP 요청 테스트
- 실제 애플리케이션 동작 검증

### Slack API 모킹

Slack 이벤트/명령어 테스트 시 실제 Slack API 호출 대신 모킹 사용:

```typescript
const mockSlackClient = {
  chat: {
    postMessage: jest.fn().mockResolvedValue({ ok: true }),
  },
};
```

### 테스트 실행 가이드

- 단일 테스트 파일 실행: `npm test -- <파일명>`
- watch 모드 사용 권장: `npm run test:watch`
- 커버리지 확인: `npm run test:cov` (coverage/ 디렉토리에 리포트 생성)

## Slack Bolt SDK Integration

### 향후 통합 가이드라인

**설치:**

```bash
npm install @slack/bolt
```

**NestJS 통합 패턴:**

- Slack Bolt App을 NestJS Provider로 등록
- SlackModule을 통한 중앙 집중식 관리
- 이벤트/명령어 핸들러를 NestJS 서비스로 구현

**디렉토리 구조 예시:**

```text
src/slack/
├── slack.module.ts       # SlackModule
├── slack.service.ts      # Slack Bolt App 래퍼
├── events/
│   └── message.event.ts  # 메시지 이벤트 핸들러
└── commands/
    └── hello.command.ts  # 슬래시 커맨드 핸들러
```

**Socket Mode vs HTTP Mode:**

- **개발 환경**: Socket Mode 권장 (ngrok 불필요)
- **프로덕션 환경**: HTTP Mode 권장 (확장성)

## Workflow

- Be sure to typecheck when you're done making a series of code changes
- Prefer running single tests, and not the whole test suite, for performance
- Don't force to change the test code to pass the test.
