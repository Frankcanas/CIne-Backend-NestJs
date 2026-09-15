import { Country } from './country.entity.js';

export class City {
  id!: number;
  name!: string;
  countryId!: number;
  isActive: boolean = true;
  country?: Country;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial?: Partial<City>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
