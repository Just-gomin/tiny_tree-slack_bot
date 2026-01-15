import { Logger } from '@nestjs/common';

export interface ProcessStreamHandlerOptions {
  maxBufferLines?: number;
}

/**
 * 프로세스 stdout/stderr 스트림을 효율적으로 관리하는 핸들러
 *
 * 링 버퍼(Ring Buffer) 패턴을 사용하여 최근 N개 라인만 메모리에 유지하고,
 * 오래된 출력은 자동으로 제거하여 메모리 누수를 방지합니다.
 *
 * 사용 예시:
 * ```typescript
 * const streamHandler = new ProcessStreamHandler(logger, { maxBufferLines: 500 });
 * process.stdout.on('data', (data) => streamHandler.handleStdout(data));
 * process.stderr.on('data', (data) => streamHandler.handleStderr(data));
 * ```
 */
export class ProcessStreamHandler {
  private outputBuffer: string[] = [];
  private errorBuffer: string[] = [];
  private readonly maxBufferLines: number;

  constructor(
    private readonly logger: Logger,
    options: ProcessStreamHandlerOptions = {},
  ) {
    this.maxBufferLines = options.maxBufferLines ?? 1000;
  }

  /**
   * 링 버퍼에 라인 추가
   * maxBufferLines를 초과하면 가장 오래된 라인을 제거
   */
  private addToBuffer(buffer: string[], line: string): void {
    buffer.push(line);
    if (buffer.length > this.maxBufferLines) {
      buffer.shift(); // 가장 오래된 라인 제거
    }
  }

  /**
   * stdout 데이터 처리
   * 줄 단위로 분리하여 버퍼에 추가하고 로깅
   */
  handleStdout(data: Buffer): void {
    const lines = data
      .toString()
      .split('\n')
      .filter((line) => line.trim());
    lines.forEach((line) => {
      this.addToBuffer(this.outputBuffer, line);
      this.logger.debug(line);
    });
  }

  /**
   * stderr 데이터 처리
   * 줄 단위로 분리하여 버퍼에 추가하고 경고 로깅
   */
  handleStderr(data: Buffer): void {
    const lines = data
      .toString()
      .split('\n')
      .filter((line) => line.trim());
    lines.forEach((line) => {
      this.addToBuffer(this.errorBuffer, line);
      this.logger.warn(line);
    });
  }

  /**
   * 최근 N개의 stdout 라인 가져오기
   */
  getRecentOutput(lines: number = 50): string {
    return this.outputBuffer.slice(-lines).join('\n');
  }

  /**
   * 최근 N개의 stderr 라인 가져오기
   */
  getRecentErrors(lines: number = 50): string {
    return this.errorBuffer.slice(-lines).join('\n');
  }

  /**
   * 에러 요약 생성 (디버깅용)
   * stderr가 있으면 stderr를 우선 반환하고, 없으면 stdout 반환
   */
  getErrorSummary(): string {
    const errors = this.getRecentErrors(20);
    return errors || this.getRecentOutput(20) || '상세 에러 메시지 없음';
  }

  /**
   * 버퍼 통계 정보
   */
  getBufferStats(): { outputLines: number; errorLines: number } {
    return {
      outputLines: this.outputBuffer.length,
      errorLines: this.errorBuffer.length,
    };
  }
}
