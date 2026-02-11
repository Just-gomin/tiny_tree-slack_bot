import { Test, TestingModule } from '@nestjs/testing';
import { ClaudeService } from './claude.service';
import { FirebaseService } from '../firebase/firebase.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('ClaudeService', () => {
  let service: ClaudeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClaudeService,
        {
          provide: FirebaseService,
          useValue: { deploy: jest.fn() },
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ClaudeService>(ClaudeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
