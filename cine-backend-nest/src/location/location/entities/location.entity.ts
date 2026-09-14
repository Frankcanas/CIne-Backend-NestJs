import { Country } from './country.entity.js';
import { City } from './city.entity.js';

export { Country, City };

export class Location {
  country!: Country;
  city!: City;

  constructor(partial?: Partial<Location>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
