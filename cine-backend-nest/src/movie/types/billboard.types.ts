export type BillboardPeriod = 'weekly' | 'today' | 'filtered';

export interface BillboardResponse {
  period: BillboardPeriod;
  from: string;
  to: string;
  totalMovies: number;
  message?: string;
  movies: Record<string, unknown>[];
}
