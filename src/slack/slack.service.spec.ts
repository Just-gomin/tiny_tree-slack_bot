import { Test, TestingModule } from '@nestjs/testing';
import { SlackService } from './slack.service';

// Bolt App 생성자가 환경 변수를 필요로 하므로 모킹
jest.mock('@slack/bolt', () => ({
  App: jest.fn().mockImplementation(() => ({
    start: jest.fn().mockResolvedValue(undefined),
    command: jest.fn(),
    event: jest.fn(),
    client: {
      chat: { postMessage: jest.fn() },
    },
  })),
}));

describe('SlackService', () => {
  let service: SlackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SlackService],
    }).compile();

    service = module.get<SlackService>(SlackService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
