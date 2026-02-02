# Tiny Tree Slack Bot

AI를 활용한 MVP 자동화 시스템 Tiny Tree의 Slack Bot 프로젝트입니다.

## 개요

Slack을 통해 아이디어를 입력받아 Claude Code CLI와 연동하여 Flutter MVP를 자동 생성하고 Firebase에 배포합니다.

**Phase 1 완료**: Slack → 계획 → 구현 → 배포 파이프라인 검증  
**Phase 2 진행중**: 커맨드 분리 (light/full 모드) 및 프롬프트 시스템 구축

## 기술 스택

- **Runtime**: Node.js 18+
- **Framework**: NestJS 11
- **Slack SDK**: @slack/bolt (Socket Mode)
- **AI Engine**: Claude Code CLI
- **Deployment**: Firebase Hosting

## 빠른 시작

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env

# 개발 서버 실행
npm run start:dev
```

## 프로젝트 구조

```text
src/
├── slack/              # Slack 이벤트/커맨드 핸들링
├── claude/             # Claude Code CLI 실행
├── firebase/           # Firebase 배포
└── common/             # 공통 유틸리티

prompts/                # 프롬프트 템플릿 (Phase 2+)
├── base/
├── modes/
└── components/
```

## 문서

- [프로젝트 계획](./plans/project-plan.md) - 상세 개발 계획
- [CLAUDE.md](./CLAUDE.md) - Claude Code 작업 가이드

## 관련 프로젝트

- [Tiny Tree App Template](https://github.com/Just-gomin/tiny_tree-app_template) - Flutter MVP 템플릿

## 라이선스

MIT License
