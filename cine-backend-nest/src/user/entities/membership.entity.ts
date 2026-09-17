export class Membership {
  id!: number;
  name!: string;
  price!: number;
  durationDays!: number;
  description?: string;
  level?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial?: Partial<Membership>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
