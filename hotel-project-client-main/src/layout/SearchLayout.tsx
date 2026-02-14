/* eslint-disable react-refresh/only-export-components */

import SearchForm from '@/component/form/SearchForm';
import extractSearchParams from '@/utils/extractSearchParams';
import { Outlet, useLoaderData, type LoaderFunctionArgs } from 'react-router-dom';

export interface SearchTerm {
  location: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: string;
  lat: string;
  lon: string;
}

const searchSchema = {
  location: '',
  checkInDate: '',
  checkOutDate: '',
  guestCount: '',
  lat: '',
  lon: '',
};

const SearchLayout = () => {
  const searchTerm = useLoaderData();
  return (
    <section className="flex h-full flex-col justify-between px-4">
      <SearchForm {...searchTerm} />
      <Outlet />
    </section>
  );
};

export default SearchLayout;

export const searchLoader = ({ request }: LoaderFunctionArgs): SearchTerm => {
  return extractSearchParams(request.url, searchSchema);
};
