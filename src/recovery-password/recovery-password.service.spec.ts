import { Test, TestingModule } from '@nestjs/testing';
import { RecoveryPasswordService } from './recovery-password.service';

describe('RecoveryPasswordService', () => {
  let service: RecoveryPasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecoveryPasswordService],
    }).compile();

    service = module.get<RecoveryPasswordService>(RecoveryPasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
