import { Test, TestingModule } from '@nestjs/testing';
import { CallHistoryService } from './call-history.service';

describe('CallHistoryService', () => {
  let service: CallHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CallHistoryService],
    }).compile();

    service = module.get<CallHistoryService>(CallHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
