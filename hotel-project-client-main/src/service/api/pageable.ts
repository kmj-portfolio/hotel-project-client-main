export type SortType = 'like' | 'review';

export interface PageableArg {
  page: number;
  size: number;
  sort: SortType | null;
}
