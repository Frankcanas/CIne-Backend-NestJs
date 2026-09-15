import { PartialType } from '@nestjs/swagger';
import {
  CreateCountryDto,
  CreateCityDto,
  CreateLocationDto,
} from './create-location.dto.js';

export class UpdateCountryDto extends PartialType(CreateCountryDto) {}

export class UpdateCityDto extends PartialType(CreateCityDto) {}

export class UpdateLocationDto extends PartialType(CreateLocationDto) {}
