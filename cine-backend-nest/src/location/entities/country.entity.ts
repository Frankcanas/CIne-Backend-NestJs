import { City } from './city.entity.js';

export class Country {
  id!: number;
  name!: string;
  cities: City[] = [];
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial?: Partial<Country>) {
    if (partial) {
      Object.assign(this, partial);
      if (partial.cities) {
        this.cities = partial.cities;
      }
    }
  }
}
