/**
 * /tinytree 커맨드의 서브커맨드 파싱 결과를 표현하는 타입
 *
 * 디스크리미네이티드 유니온으로 설계하여,
 * 핸들러에서 switch(subCommand.type)으로 타입 안전하게 분기 가능
 */
export type SubCommand =
  | { type: 'new'; mode: 'light' | 'full'; idea: string }
  | { type: 'cancel' }
  | { type: 'status' }
  | { type: 'rename'; name: string }
  | { type: 'unknown'; raw: string };

/**
 * 커맨드 핸들러가 공통으로 받는 실행 컨텍스트
 */
export interface TinyTreeCommandContext {
  userId: string;
  channelId: string;
  subCommand: SubCommand;
  /** 디버깅용 원문 텍스트 (command.text) */
  raw: string;
}
