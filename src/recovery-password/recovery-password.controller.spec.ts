import { Test, TestingModule } from '@nestjs/testing';
import { RecoveryPasswordController } from './recovery-password.controller';

describe('RecoveryPasswordController', () => {
  let controller: RecoveryPasswordController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecoveryPasswordController],
    }).compile();

    controller = module.get<RecoveryPasswordController>(RecoveryPasswordController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
