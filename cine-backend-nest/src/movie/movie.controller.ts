import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { TmdbService } from './services/tmdb.service.js';
import { MovieService } from './services/movie.service.js';
import { TmdbQueryDto, TmdbSearchQueryDto } from './dto/tmdb-query.dto.js';
import { CreateMovieDto } from './dto/create-movie.dto.js';
import { UpdateMovieDto } from './dto/update-movie.dto.js';
import { MovieFilterDto } from './dto/movie-filter.dto.js';
import { Movie } from './entities/movie.entity.js';

@Controller(['movies', 'movie'])
export class MovieController {
  constructor(
    private readonly tmdbService: TmdbService,
    private readonly movieService: MovieService,
  ) {}

  // ==========================================
  // Endpoints TMDB (The Movie Database)
  // ==========================================

  @Get('tmdb/popular')
  @ApiTags('Movies - TMDB')
  @ApiOperation({
    summary: 'Obtener películas populares directamente desde TMDB',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de películas populares obtenida de TMDB',
  })
  async getPopularFromTmdb(@Query() query: TmdbQueryDto) {
    return this.tmdbService.getPopularMovies(query.page, query.language);
  }

  @Get('tmdb/now-playing')
  @ApiTags('Movies - TMDB')
  @ApiOperation({
    summary: 'Obtener películas en cartelera (Now Playing) desde TMDB',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de películas en cartelera obtenida de TMDB',
  })
  async getNowPlayingFromTmdb(@Query() query: TmdbQueryDto) {
    return this.tmdbService.getNowPlayingMovies(query.page, query.language);
  }

  @Get('tmdb/upcoming')
  @ApiTags('Movies - TMDB')
  @ApiOperation({ summary: 'Obtener próximos estrenos desde TMDB' })
  @ApiResponse({
    status: 200,
    description: 'Lista de próximos estrenos obtenida de TMDB',
  })
  async getUpcomingFromTmdb(@Query() query: TmdbQueryDto) {
    return this.tmdbService.getUpcomingMovies(query.page, query.language);
  }

  @Get('tmdb/top-rated')
  @ApiTags('Movies - TMDB')
  @ApiOperation({ summary: 'Obtener películas mejor valoradas desde TMDB' })
  @ApiResponse({
    status: 200,
    description: 'Películas mejor valoradas obtenidas de TMDB',
  })
  async getTopRatedFromTmdb(@Query() query: TmdbQueryDto) {
    return this.tmdbService.getTopRatedMovies(query.page, query.language);
  }

  @Get('tmdb/search')
  @ApiTags('Movies - TMDB')
  @ApiOperation({ summary: 'Buscar películas en TMDB por título' })
  @ApiResponse({
    status: 200,
    description: 'Resultados de la búsqueda en TMDB',
  })
  @ApiResponse({
    status: 400,
    description: 'El parámetro query es obligatorio',
  })
  async searchTmdbMovies(@Query() queryDto: TmdbSearchQueryDto) {
    if (!queryDto.query || queryDto.query.trim() === '') {
      throw new BadRequestException(
        "El parámetro de búsqueda 'query' es requerido",
      );
    }
    return this.tmdbService.searchMovies(
      queryDto.query,
      queryDto.page,
      queryDto.language,
    );
  }

  @Get('tmdb/genres')
  @ApiTags('Movies - TMDB')
  @ApiOperation({ summary: 'Obtener la lista oficial de géneros desde TMDB' })
  @ApiResponse({
    status: 200,
    description: 'Lista oficial de géneros de TMDB',
  })
  async getTmdbGenres(@Query('language') language?: string) {
    return this.tmdbService.getGenres(language || 'es-ES');
  }

  @Get('tmdb/:tmdbId')
  @ApiTags('Movies - TMDB')
  @ApiOperation({
    summary: 'Obtener detalle completo de una película en TMDB (con director, reparto y tráiler)',
  })
  @ApiParam({ name: 'tmdbId', type: Number, description: 'ID de TMDB' })
  @ApiResponse({
    status: 200,
    description: 'Detalle de la película con director, actores y trailer',
  })
  @ApiResponse({ status: 404, description: 'Película no encontrada en TMDB' })
  async getTmdbMovieDetails(
    @Param('tmdbId', ParseIntPipe) tmdbId: number,
    @Query('language') language?: string,
  ) {
    return this.tmdbService.getMovieDetails(tmdbId, language || 'es-ES');
  }

  @Get('tmdb/:tmdbId/recommendations')
  @ApiTags('Movies - TMDB')
  @ApiOperation({
    summary: 'Obtener recomendaciones de películas basadas en una película de TMDB',
  })
  @ApiParam({ name: 'tmdbId', type: Number, description: 'ID de TMDB' })
  @ApiResponse({
    status: 200,
    description: 'Lista de películas recomendadas de TMDB',
  })
  async getTmdbRecommendations(
    @Param('tmdbId', ParseIntPipe) tmdbId: number,
    @Query() query: TmdbQueryDto,
  ) {
    return this.tmdbService.getMovieRecommendations(
      tmdbId,
      query.page,
      query.language,
    );
  }

  @Post('tmdb/sync-genres')
  @HttpCode(HttpStatus.OK)
  @ApiTags('Movies - TMDB')
  @ApiOperation({
    summary: 'Sincronizar el catálogo de géneros desde TMDB a la base local',
  })
  @ApiResponse({
    status: 200,
    description: 'Géneros sincronizados exitosamente',
  })
  async syncGenresFromTmdb() {
    const genres = await this.movieService.syncGenresFromTmdb();
    return { message: 'Géneros sincronizados correctamente', genres };
  }

  @Post('tmdb/sync/:tmdbId')
  @HttpCode(HttpStatus.CREATED)
  @ApiTags('Movies - TMDB')
  @ApiOperation({
    summary: 'Sincronizar e importar una película de TMDB al catálogo local',
  })
  @ApiParam({ name: 'tmdbId', type: Number, description: 'ID de TMDB' })
  @ApiResponse({
    status: 201,
    description: 'Película importada/sincronizada correctamente en el catálogo local',
    type: Movie,
  })
  async syncMovieWithTmdb(@Param('tmdbId', ParseIntPipe) tmdbId: number) {
    return this.movieService.syncWithTmdb(tmdbId);
  }

  // ==========================================
  // Endpoints del Catálogo Local de Películas (Movies)
  // ==========================================

  @Get()
  @ApiTags('Movies')
  @ApiOperation({
    summary: 'Obtener todas las películas del catálogo local con filtros opcionales',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de películas locales obtenida exitosamente',
    type: [Movie],
  })
  async getMovies(@Query() filter: MovieFilterDto) {
    return this.movieService.getMovies(filter);
  }

  @Get(':id')
  @ApiTags('Movies')
  @ApiOperation({ summary: 'Obtener detalle de una película local por su ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la película local' })
  @ApiResponse({
    status: 200,
    description: 'Detalle de la película',
    type: Movie,
  })
  @ApiResponse({ status: 404, description: 'Película no encontrada' })
  async getMovieById(@Param('id', ParseIntPipe) id: number) {
    return this.movieService.findById(id);
  }

  @Get(':id/recommendations')
  @ApiTags('Movies')
  @ApiOperation({
    summary: 'Obtener recomendaciones para una película local',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la película local' })
  @ApiResponse({
    status: 200,
    description: 'Lista de películas recomendadas',
  })
  async getMovieRecommendations(@Param('id', ParseIntPipe) id: number) {
    return this.movieService.getMovieRecommendations(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiTags('Movies')
  @ApiOperation({ summary: 'Crear una película manualmente en el catálogo local' })
  @ApiResponse({
    status: 201,
    description: 'Película creada exitosamente',
    type: Movie,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  async createMovie(@Body() createMovieDto: CreateMovieDto) {
    return this.movieService.createMovie(createMovieDto);
  }

  @Put(':id')
  @ApiTags('Movies')
  @ApiOperation({ summary: 'Actualizar una película local por su ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la película local' })
  @ApiResponse({
    status: 200,
    description: 'Película actualizada exitosamente',
    type: Movie,
  })
  @ApiResponse({ status: 404, description: 'Película no encontrada' })
  async updateMovie(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMovieDto: UpdateMovieDto,
  ) {
    return this.movieService.updateMovie(id, updateMovieDto);
  }

  @Delete(':id')
  @ApiTags('Movies')
  @ApiOperation({ summary: 'Eliminar una película local por su ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la película local' })
  @ApiResponse({
    status: 200,
    description: 'Película eliminada correctamente',
  })
  @ApiResponse({ status: 404, description: 'Película no encontrada' })
  async deleteMovie(@Param('id', ParseIntPipe) id: number) {
    return this.movieService.deleteMovie(id);
  }
}
