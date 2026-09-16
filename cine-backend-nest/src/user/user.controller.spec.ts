import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller.js';
import { UserService } from './user.service.js';
import { AuthGuard } from './guards/auth.guard.js';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: AuthGuard,
          useValue: { canActivate: () => true },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it('debe crear un usuario y retornarlo sanitizado', async () => {
    const user = await controller.create({
      name: 'Mario Perez',
      email: 'mario@example.com',
      phoneNumber: '3112223344',
      password: 'StrongPassword123!',
      city: 'Medellín',
    });

    expect(user).toBeDefined();
    expect(user.id).toBe(1);
    expect(user.name).toBe('Mario Perez');
    expect((user as any).password).toBeUndefined();
  });

  it('debe listar todos los usuarios', async () => {
    await controller.create({
      name: 'Usuario Uno',
      email: 'u1@test.com',
      phoneNumber: '3000000001',
      password: 'StrongPassword123!',
    });

    const list = await controller.findAll();
    expect(list.length).toBeGreaterThan(0);
    expect((list[0] as any).password).toBeUndefined();
  });

  it('debe obtener y actualizar el perfil de un usuario por id', async () => {
    const created = await controller.create({
      name: 'Elena Garcia',
      email: 'elena@test.com',
      phoneNumber: '3000000002',
      password: 'StrongPassword123!',
      city: 'Barranquilla',
    });

    const profile = await controller.getProfileById(created.id);
    expect(profile.name).toBe('Elena Garcia');
    expect(profile.membership.active).toBe(true);

    const updated = await controller.updateProfileById(created.id, {
      city: 'Cartagena',
    });
    expect(updated.message).toBe('Perfil actualizado correctamente');
    expect(updated.user.city).toBe('Cartagena');
  });

  it('debe verificar la cuenta con el código de 6 dígitos', async () => {
    const created = await controller.create({
      name: 'David',
      email: 'david@test.com',
      phoneNumber: '3000000003',
      password: 'StrongPassword123!',
    });

    const tokenRecord = (service as any).verificationTokens.get(created.id);

    const verification = await controller.verifyAccount({
      userId: created.id,
      token: tokenRecord.token,
    });

    expect(verification.success).toBe(true);
    expect(verification.message).toContain('Cuenta activada');
  });
});
