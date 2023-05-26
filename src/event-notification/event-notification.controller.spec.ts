import { Test, TestingModule } from '@nestjs/testing';
import { EventNotificationController } from './event-notification.controller';

describe('EventNotificationController', () => {
  let controller: EventNotificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventNotificationController],
    }).compile();

    controller = module.get<EventNotificationController>(EventNotificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
