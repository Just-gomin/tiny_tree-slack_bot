# CLAUDE.md - Tiny Tree Slack Bot

## Answering Request

- Please answer in korean.

## Project Overview

NestJS 11 기반 Slack Bot으로 Tiny Tree의 사용자 인터페이스 역할을 합니다.  
Socket Mode로 Slack과 연동하며, Claude Code CLI를 실행하여 MVP를 생성하고 Firebase에 배포합니다.

**현재 Phase**: 2 (커맨드 시스템 재설계 및 프롬프트 고도화)

## Project Structure

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
├── project/            # 프로젝트 관리
│   ├── complexity/     # 복잡도 계산
│   └── lifecycle/      # 생명주기 관리
└── common/             # 공통 유틸리티

prompts/                # 프롬프트 템플릿
├── base/               # 기본 시스템 프롬프트
├── modes/              # light/full 모드별
└── components/         # 재사용 가능한 조각
```

## Key Decisions

### 1. 커맨드 체계

**계층적 구조 채택**:

```text
/tinytree new light     # 간단한 MVP
/tinytree new full      # 복잡한 프로젝트
/tinytree cancel        # 작업 중단
/tinytree status        # 진행 상황
```

**근거**: 확장성, 자동완성 친화적, 직관적

### 2. 프롬프트 관리 위치

**Slack Bot 리포지토리에 저장** (`prompts/` 디렉토리)

**근거**:

- 배포 간편
- 버전 관리 용이
- Slack Bot이 직접 접근 가능

### 3. 복잡도 판단 기준

```typescript
score = features*2 + screens*1.5 + dataModels 
        + externalAPIs*3 + stateComplexity
        
// score < 20 → light
// score ≥ 20 → full
```

**근거**: 기능 수, 화면 수, 데이터 복잡도, API 연동을 종합적으로 고려

### 4. light vs full 차별화

| 측면 | light | full |
| :------: | :------: | :------: |
| 타겟 | 프로토타입 | 실제 서비스 |
| 시간 | 30분-1시간 | 2-4시간 |
| 패키지 | 사용 안함 | app_core 활용 |
| 계획서 | PLAN.md | PLAN + ARCHITECTURE + TASKS |

## Environment Variables

```env
# Slack
SLACK_APP_TOKEN=xapp-...      # Socket Mode
SLACK_BOT_TOKEN=xoxb-...      # Bot Token
SLACK_SIGNING_SECRET=...      # Signing Secret

# Claude
ANTHROPIC_API_KEY=...         # API Key
CLAUDE_CODE_PATH=...          # CLI 경로

# Firebase
FIREBASE_PROJECT_ID=...
FIREBASE_TOKEN=...

# Project
TINY_TREE_PATH=...            # App Template 경로
```

## Bash Commands

### Development

```bash
npm run start:dev      # watch 모드
npm run start:debug    # 디버그 모드
npm run build          # 빌드
```

### Test & Quality

```bash
npm test               # 단위 테스트
npm run test:e2e       # E2E 테스트
npm run lint           # ESLint
npm run format         # Prettier
```

## Code Style

- ES modules 사용 (import/export)
- Single quotes
- Trailing commas
- NestJS Decorators 활용
- TypeScript strict mode

## Testing

- **단위 테스트**: `src/**/*.spec.ts`
- **E2E 테스트**: `test/**/*.e2e-spec.ts`
- Slack API는 모킹 사용

## Workflow

1. 코드 변경 후 `npm run typecheck`
2. 단일 테스트 파일 실행 권장
3. 테스트 통과를 위해 테스트 코드 강제 수정 금지

## Important Notes

### Phase 2 작업 시 주의사항

1. **프롬프트 템플릿 작성**
   - base 프롬프트부터 작성
   - light/full 차별화 명확히
   - 구체적인 제약사항 명시
   - 예제 포함

2. **복잡도 계산 로직**
   - 사용자 입력에서 feature, screen 등 추출
   - 계산 결과를 로그로 남김
   - 경계 케이스 (score = 19, 20) 주의

3. **에러 처리**
   - Claude Code 실행 실패 시 재시도 로직
   - 사용자에게 명확한 에러 메시지
   - 로그 파일 저장

4. **메모리 관리**
   - GCP e2-micro는 1GB RAM
   - 동시 실행 제한
   - 큰 파일 스트리밍 처리

## Related Documents

- [프로젝트 계획](./plans/project-plan.md)
- [README.md](./README.md)

## 관련 프로젝트

- [Tiny Tree App Template](https://github.com/Just-gomin/tiny_tree-app_template)
