import { Test, TestingModule } from '@nestjs/testing';
import { EmailController } from './email.controller.js';
import { EmailService } from './email.service.js';
import { UserService } from '../user/user.service.js';

describe('EmailController', () => {
  let controller: EmailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailController],
      providers: [
        {
          provide: EmailService,
          useValue: { send: vi.fn(), sendVerificationEmail: vi.fn() },
        },
        {
          provide: UserService,
          useValue: { findById: vi.fn(), getAllMemberships: vi.fn() },
        },
      ],
    }).compile();

    controller = module.get<EmailController>(EmailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
