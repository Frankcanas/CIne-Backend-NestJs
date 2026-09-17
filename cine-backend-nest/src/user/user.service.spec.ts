import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { comparePassword } from './utils/password.util.js';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear un usuario exitosamente con membresía Clásica y contraseña hasheada', async () => {
      const user = await service.create({
        name: 'Carlos Ruiz',
        email: 'carlos@example.com',
        phoneNumber: '3001234567',
        password: 'Password123!',
        city: 'Bogotá',
      });

      expect(user).toBeDefined();
      expect(user.id).toBe(1);
      expect(user.name).toBe('Carlos Ruiz');
      expect(user.email).toBe('carlos@example.com');
      expect((user as any).password).toBeUndefined(); // Sanitizado
      expect(user.membership?.name).toBe('Clásica');
      expect(user.membershipCode).toMatch(/^MEM-/);
      expect(user.isVerified).toBe(false);
      expect(user.isActive).toBe(false);

      // Verificar que la contraseña interna fue hasheada con bcrypt
      const internalUser = await service.findById(user.id);
      expect(internalUser).toBeDefined();
      expect(internalUser?.password).not.toBe('Password123!');
      const matches = await comparePassword('Password123!', internalUser!.password);
      expect(matches).toBe(true);
    });

    it('debe rechazar contraseñas que no cumplan la política de seguridad', async () => {
      // Menos de 10 caracteres
      await expect(
        service.create({
          name: 'Test',
          email: 'test1@example.com',
          phoneNumber: '111111111',
          password: 'Pass1!',
        }),
      ).rejects.toThrow(BadRequestException);

      // Sin número
      await expect(
        service.create({
          name: 'Test',
          email: 'test2@example.com',
          phoneNumber: '222222222',
          password: 'PasswordTest!',
        }),
      ).rejects.toThrow(BadRequestException);

      // Sin carácter especial
      await expect(
        service.create({
          name: 'Test',
          email: 'test3@example.com',
          phoneNumber: '333333333',
          password: 'PasswordTest123',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe rechazar correo duplicado', async () => {
      await service.create({
        name: 'Usuario 1',
        email: 'duplicado@example.com',
        phoneNumber: '3000000001',
        password: 'Password123!',
      });

      await expect(
        service.create({
          name: 'Usuario 2',
          email: 'duplicado@example.com',
          phoneNumber: '3000000002',
          password: 'Password123!',
        }),
      ).rejects.toThrow(new BadRequestException('Email ya registrado'));
    });

    it('debe rechazar número de teléfono duplicado', async () => {
      await service.create({
        name: 'Usuario 1',
        email: 'u1@example.com',
        phoneNumber: '3111111111',
        password: 'Password123!',
      });

      await expect(
        service.create({
          name: 'Usuario 2',
          email: 'u2@example.com',
          phoneNumber: '3111111111',
          password: 'Password123!',
        }),
      ).rejects.toThrow(new BadRequestException('Número de teléfono ya registrado'));
    });

    it('debe admitir alias de preferencia de notificaciones (preferenciaNotificaciones)', async () => {
      const user = await service.create({
        name: 'Usuario Notif',
        email: 'notif@example.com',
        phoneNumber: '3222222222',
        password: 'Password123!',
        preferenciaNotificaciones: false,
      });

      expect(user.notificationPreference).toBe(false);
    });
  });

  describe('findAll y findById', () => {
    it('debe retornar todos los usuarios sanitizados', async () => {
      await service.create({
        name: 'User 1',
        email: 'u1@cine.com',
        phoneNumber: '3333333331',
        password: 'Password123!',
      });
      await service.create({
        name: 'User 2',
        email: 'u2@cine.com',
        phoneNumber: '3333333332',
        password: 'Password123!',
      });

      const all = await service.findAll();
      expect(all.length).toBe(2);
      expect((all[0] as any).password).toBeUndefined();
      expect((all[1] as any).password).toBeUndefined();
    });

    it('debe lanzar NotFoundException si no existe el usuario por id', async () => {
      await expect(service.findSanitizedById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getProfile y updateProfile', () => {
    it('debe retornar el perfil completo del usuario con la membresía calculada', async () => {
      const created = await service.create({
        name: 'Laura Gomez',
        email: 'laura@example.com',
        phoneNumber: '3444444444',
        password: 'Password123!',
        city: 'Medellín',
      });

      const profile = await service.getProfile(created.id);
      expect(profile.id).toBe(created.id);
      expect(profile.name).toBe('Laura Gomez');
      expect(profile.membership).toBeDefined();
      expect(profile.membership.active).toBe(true);
      expect(profile.membership.membershipName).toBe('Clásica');
      expect(profile.membership.points).toBe(0);
      expect(profile.membership.expiresAt).toBeDefined();
    });

    it('debe actualizar los datos de perfil correctamente', async () => {
      const created = await service.create({
        name: 'Andres',
        email: 'andres@example.com',
        phoneNumber: '3555555555',
        password: 'Password123!',
      });

      const updated = await service.updateProfile(created.id, {
        name: 'Andres Felipe',
        city: 'Cali',
        phoneNumber: '3555555556',
      });

      expect(updated.name).toBe('Andres Felipe');
      expect(updated.city).toBe('Cali');
      expect(updated.phoneNumber).toBe('3555555556');
    });

    it('debe rechazar actualización si el teléfono ya pertenece a otro usuario', async () => {
      await service.create({
        name: 'User A',
        email: 'a@example.com',
        phoneNumber: '3666666661',
        password: 'Password123!',
      });
      const userB = await service.create({
        name: 'User B',
        email: 'b@example.com',
        phoneNumber: '3666666662',
        password: 'Password123!',
      });

      await expect(
        service.updateProfile(userB.id, { phoneNumber: '3666666661' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyToken', () => {
    it('debe activar la cuenta cuando el token es válido', async () => {
      const created = await service.create({
        name: 'Sofia',
        email: 'sofia@example.com',
        phoneNumber: '3777777777',
        password: 'Password123!',
      });

      // Obtener el token generado en memoria
      const tokenRecord = (service as any).verificationTokens.get(created.id);
      expect(tokenRecord).toBeDefined();

      const result = await service.verifyToken(created.id, tokenRecord.token);
      expect(result.success).toBe(true);
      expect(result.message).toContain('Cuenta activada');

      const verifiedUser = await service.findById(created.id);
      expect(verifiedUser?.isVerified).toBe(true);
      expect(verifiedUser?.isActive).toBe(true);
    });

    it('debe fallar si el código introducido es incorrecto', async () => {
      const created = await service.create({
        name: 'Pedro',
        email: 'pedro@example.com',
        phoneNumber: '3888888888',
        password: 'Password123!',
      });

      const result = await service.verifyToken(created.id, '000000');
      expect(result.success).toBe(false);
      expect(result.message).toBe('El código introducido es incorrecto.');
    });
  });
});
