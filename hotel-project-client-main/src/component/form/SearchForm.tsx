import LocationInput from '../search/LocationInput';
import DateInput from '../search/DateInput';
import PersonnelInput from '../search/PersonnelInput';
import { PrimaryButton } from '../common/button/PrimaryButton';
import { Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { SearchSchema, type SearchType } from '@/schema/SearchSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import buildSearchQuery from '@/utils/buildSearchQuery';
import getCoordsByAddress from '@/service/api/geocorder/getCoordsByAddress';
import { formatDateToISOstring } from '@/utils/format/formatUtil';

interface SearchFormProps {
  location?: string;
  checkInDate?: string;
  checkOutDate?: string;
  guestCount?: string;
}

export interface DateRange {
  from: string;
  to?: string;
}

const SearchForm = ({ location, checkInDate, checkOutDate, guestCount }: SearchFormProps) => {
  const navigate = useNavigate();

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(SearchSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      location: location || '서울',
      checkInDate: checkInDate || formatDateToISOstring(new Date()),
      checkOutDate:
        checkOutDate || formatDateToISOstring(new Date(Date.now() + 24 * 60 * 60 * 1000)),
      guestCount: guestCount || '1',
    },
  });

  const onSubmit = async (data: SearchType) => {
    // 주소 -> 좌표 변환
    const { lat, lon } = await getCoordsByAddress(data.location);

    const queryString = buildSearchQuery({ ...data, lat, lon });
    navigate(`/search?${queryString}`);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-gray-primary/30 md:bg-gray-primary/60 mb-4 flex w-full flex-col space-y-2.5 rounded-2xl p-4 md:flex-row md:gap-2 md:space-y-0"
    >
      <LocationInput name="location" control={control} />
      <DateInput checkInName="checkInDate" checkOutName="checkOutDate" control={control} />
      <PersonnelInput name="guestCount" control={control} />
      <PrimaryButton size="lg" bold>
        <span className="md:hidden">검색</span>
        <span className="hidden md:block">
          <Search />
        </span>
      </PrimaryButton>
    </form>
  );
};

export default SearchForm;
