import { Membership } from './membership.entity.js';

export class User {
  id!: number;
  name!: string;
  email!: string;
  phoneNumber!: string;
  password!: string;
  city?: string;
  notificationPreference: boolean = true;
  membershipId?: number;
  membership?: Membership;
  points: number = 0;
  membershipStartDate?: Date;
  membershipCode?: string;
  isActive: boolean = false;
  isVerified: boolean = false;
  failedLoginAttempts: number = 0;
  lockoutUntil?: Date | null;
  refreshToken?: string | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(partial?: Partial<User>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  /**
   * Retorna una representación del usuario sanitizada (sin la propiedad password).
   */
  toSanitized(): Omit<User, 'password'> {
    const copy = { ...this };
    delete (copy as Partial<User>).password;
    return copy;
  }
}
