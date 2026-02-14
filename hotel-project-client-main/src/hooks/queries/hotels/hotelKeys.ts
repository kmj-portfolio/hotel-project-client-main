import type { SearchType } from '@/schema/SearchSchema';

const hotelKeys = {
  searchHotels: (searchTerm: SearchType) => ['hotels', 'search', searchTerm],
  hotelsList: ['hotels', 'all'],
  hotel: (hotelId: string) => ['hotel', hotelId],
};

export default hotelKeys;
