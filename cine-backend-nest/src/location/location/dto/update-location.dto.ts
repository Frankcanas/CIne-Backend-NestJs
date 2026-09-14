export class UpdateCountryDto {
  name?: string;
}

export class UpdateCityDto {
  name?: string;
  countryId?: number;
  isActive?: boolean;
}

export class UpdateLocationDto {
  countryName?: string;
  cityName?: string;
  countryId?: number;
  isActive?: boolean;
}
