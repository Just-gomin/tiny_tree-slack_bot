export class ProgressEvent {
  constructor(
    public readonly channelId: string,
    public readonly message: string,
    public readonly phase?: string,
    public readonly details?: Record<string, unknown>,
  ) {}
}
