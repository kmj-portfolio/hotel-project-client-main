export interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface Pageable {
  offset: number;
  sort: Sort;
  pageSize: number;
  paged: boolean;
  pageNumber: number;
  unpaged: boolean;
}

export interface PaginationResult<T> {
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  size: number;
  content: T[];
  number: number;
  sort: Sort;
  numberOfElements: number;
  pageable: Pageable;
  empty: boolean;
}

export type SortType = 'like' | 'review';

export interface PageableArg {
  page: number;
  size: number;
  sort: SortType | null;
}
