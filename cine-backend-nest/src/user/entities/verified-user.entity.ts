export class VerifiedUser {
  userId!: number;
  token?: string | null;
  verifiedAt!: Date;

  constructor(partial?: Partial<VerifiedUser>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
