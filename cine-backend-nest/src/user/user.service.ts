import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import crypto from 'crypto';
import { User } from './entities/user.entity.js';
import { Membership } from './entities/membership.entity.js';
import { VerifiedUser } from './entities/verified-user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserProfileDto } from './dto/user-profile.dto.js';
import { hashPassword, validatePassword } from './utils/password.util.js';

@Injectable()
export class UserService {
  private users: User[] = [];
  private memberships: Membership[] = [];
  private verifiedUsers: VerifiedUser[] = [];
  private verificationTokens = new Map<
    number,
    { token: string; email: string; expiresAt: Date }
  >();
  private userIdCounter = 1;
  private membershipIdCounter = 1;

  constructor() {
    this.seedInitialMemberships();
  }

  /**
   * Carga inicial de membresías base (HU-006: Membresía "Clásica" por defecto).
   */
  private seedInitialMemberships(): void {
    const clasica = new Membership({
      id: this.membershipIdCounter++,
      name: 'Clásica',
      level: '1',
      price: 0,
      durationDays: 365,
      description:
        'Membresía inicial con acumulación básica de puntos y descuentos en funciones seleccionadas.',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const premium = new Membership({
      id: this.membershipIdCounter++,
      name: 'Premium',
      level: '2',
      price: 15.99,
      durationDays: 365,
      description:
        'Membresía preferencial con beneficios exclusivos y estrenos anticipados.',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.memberships.push(clasica, premium);
  }

  /**
   * Crea un nuevo usuario aplicando las validaciones de negocio:
   * - Email válido y no duplicado
   * - Teléfono no duplicado
   * - Complejidad y longitud de la contraseña
   * - Asignación automática de membresía "Clásica"
   * - Generación de código único de membresía y token de verificación (HU-006)
   */
  async create(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const notificationPreference =
      dto.notificationPreference ?? dto.preferenciaNotificaciones ?? true;

    // Validación de robustez de contraseña
    const passwordStatus = validatePassword(dto.password);
    if (!passwordStatus.isValid) {
      throw new BadRequestException(
        'La contraseña debe tener mayúscula, minúscula, número, carácter especial y 10 o más caracteres.',
      );
    }

    // Validación de email duplicado
    const emailExists = this.users.some(
      (u) => u.email.toLowerCase() === dto.email.trim().toLowerCase(),
    );
    if (emailExists) {
      throw new BadRequestException('Email ya registrado');
    }

    // Validación de teléfono duplicado
    const phoneExists = this.users.some(
      (u) => u.phoneNumber.trim() === dto.phoneNumber.trim(),
    );
    if (phoneExists) {
      throw new BadRequestException('Número de teléfono ya registrado');
    }

    // Hash de la contraseña con bcrypt
    const hashedPassword = await hashPassword(dto.password);

    // Auto-asignación de membresía base (HU-006)
    let defaultMembership = this.memberships.find(
      (m) => m.name.toLowerCase() === 'clásica' || m.name.toLowerCase() === 'clasica',
    );
    if (!defaultMembership) {
      defaultMembership = new Membership({
        id: this.membershipIdCounter++,
        name: 'Clásica',
        level: '1',
        price: 0,
        durationDays: 365,
        description:
          'Membresía inicial con acumulación básica de puntos y descuentos en funciones seleccionadas.',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      this.memberships.push(defaultMembership);
    }

    const membershipCode = `MEM-${crypto.randomBytes(3).toString('hex').toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    const user = new User({
      id: this.userIdCounter++,
      name: dto.name.trim(),
      email: dto.email.trim().toLowerCase(),
      phoneNumber: dto.phoneNumber.trim(),
      password: hashedPassword,
      city: dto.city?.trim(),
      notificationPreference,
      membershipId: defaultMembership.id,
      membership: defaultMembership,
      points: 0,
      membershipStartDate: new Date(),
      membershipCode,
      isActive: false,
      isVerified: false,
      failedLoginAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.users.push(user);

    // Generar token de verificación de correo por 24 horas (HU-006)
    await this.requestVerificationToken(user.id, user.email);

    return user.toSanitized();
  }

  /**
   * Obtiene todos los usuarios sanitizados (sin hash de contraseña).
   */
  async findAll(): Promise<Omit<User, 'password'>[]> {
    return this.users.map((user) => user.toSanitized());
  }

  /**
   * Obtiene la entidad de usuario por ID (incluyendo password para procesos internos como auth).
   */
  async findById(id: number): Promise<User | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }

  /**
   * Obtiene un usuario por ID sanitizado.
   */
  async findSanitizedById(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user.toSanitized();
  }

  /**
   * Obtiene un usuario por correo electrónico.
   */
  async findByEmail(email: string): Promise<User | null> {
    return (
      this.users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
      ) ?? null
    );
  }

  /**
   * Obtiene el perfil completo del usuario con el cálculo dinámico de su membresía.
   */
  async getProfile(userId: number): Promise<UserProfileDto> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const membership =
      user.membership ??
      this.memberships.find((m) => m.id === user.membershipId);

    let active = false;
    let expiresAt: Date | null = null;

    if (membership && user.membershipStartDate) {
      const startDate = new Date(user.membershipStartDate);
      expiresAt = new Date(startDate);
      expiresAt.setDate(expiresAt.getDate() + membership.durationDays);
      active = expiresAt.getTime() > Date.now();
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      city: user.city,
      notificationPreference: user.notificationPreference ?? true,
      membership: {
        active,
        level: membership?.level || null,
        points: user.points,
        membershipName: membership?.name || null,
        benefits: membership?.description || null,
        expiresAt,
      },
    };
  }

  /**
   * Actualiza los datos del perfil de un usuario.
   */
  async updateProfile(
    userId: number,
    dto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (dto.name && dto.name.trim() !== '') {
      user.name = dto.name.trim();
    }

    if (dto.phoneNumber && dto.phoneNumber.trim() !== '') {
      const phoneInUse = this.users.some(
        (u) => u.id !== userId && u.phoneNumber === dto.phoneNumber!.trim(),
      );
      if (phoneInUse) {
        throw new BadRequestException('Número de teléfono ya registrado');
      }
      user.phoneNumber = dto.phoneNumber.trim();
    }

    if (dto.city !== undefined) {
      user.city = dto.city.trim();
    }

    if (dto.notificationPreference !== undefined) {
      user.notificationPreference = dto.notificationPreference;
    }

    user.updatedAt = new Date();

    return user.toSanitized();
  }

  /**
   * Genera o renueva un token de verificación de 6 dígitos con expiración de 24 horas.
   */
  async requestVerificationToken(
    userId: number,
    email: string,
  ): Promise<{ token: string; expiresAt: Date }> {
    const isAlreadyVerified = this.verifiedUsers.some(
      (v) => v.userId === userId,
    );
    if (isAlreadyVerified) {
      throw new BadRequestException('El usuario ya está verificado.');
    }

    const token = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    this.verificationTokens.set(userId, { token, email, expiresAt });
    return { token, expiresAt };
  }

  /**
   * Valida el código de verificación y activa la cuenta del usuario.
   */
  async verifyToken(
    userId: number,
    token: string,
  ): Promise<{ success: boolean; message: string }> {
    const isAlreadyVerified = this.verifiedUsers.some(
      (v) => v.userId === userId,
    );
    if (isAlreadyVerified) {
      return { success: false, message: 'El usuario ya está verificado.' };
    }

    const record = this.verificationTokens.get(userId);
    if (!record || record.token !== token) {
      return {
        success: false,
        message: 'El código introducido es incorrecto.',
      };
    }

    if (new Date() > record.expiresAt) {
      this.verificationTokens.delete(userId);
      return {
        success: false,
        message: 'El código ha expirado. Solicita uno nuevo.',
      };
    }

    this.verificationTokens.delete(userId);
    this.verifiedUsers.push(
      new VerifiedUser({
        userId,
        token,
        verifiedAt: new Date(),
      }),
    );

    const user = await this.findById(userId);
    if (user) {
      user.isVerified = true;
      user.isActive = true;
      user.updatedAt = new Date();
    }

    return {
      success: true,
      message: 'Token validado con éxito. Cuenta activada.',
    };
  }

  /**
   * Elimina un usuario por ID.
   */
  async remove(id: number): Promise<{ message: string }> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    this.users.splice(index, 1);
    this.verificationTokens.delete(id);
    this.verifiedUsers = this.verifiedUsers.filter((v) => v.userId !== id);

    return { message: `Usuario con ID ${id} eliminado correctamente` };
  }
}
