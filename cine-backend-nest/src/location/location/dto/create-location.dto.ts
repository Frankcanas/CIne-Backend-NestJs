export class CreateCountryDto {
  name!: string;
}

export class CreateCityDto {
  name!: string;
  countryId!: number;
  isActive?: boolean = true;
}

export class SetUserLocationDto {
  userId!: number;
  city!: string;
}

export class CreateLocationDto {
  countryName?: string;
  cityName?: string;
  countryId?: number;
}
