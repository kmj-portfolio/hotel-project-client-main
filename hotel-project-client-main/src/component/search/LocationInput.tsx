import { useEffect, useState } from 'react';
import { LocateFixed, MapPin } from 'lucide-react';
import { type Control, type Path, type FieldValues, useController } from 'react-hook-form';

import useDebounce from '@/hooks/useDebounce';

import getAddressByCoords from '@/service/api/geocorder/getAddressByCoords';

import autoComplete from '@/utils/autoComplete';

import SearchLabel from '../common/label/SearchLabel';
import CommonInput from '../common/input/CommonInput';
import { PrimaryButton } from '../common/button/PrimaryButton';

import Modal from '../modal/Modal';
import ModalWrapper from '../modal/ModalWrapper';
import ModalHeader from '../modal/ModalHeader';
import axios from 'axios';

interface LocationInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
}

const LocationInput = <T extends FieldValues>({ name, control }: LocationInputProps<T>) => {
  const {
    field: { onChange, value },
    fieldState,
  } = useController({ name, control });
  const [regions, setRegions] = useState<string[]>([]); // 시군구 데이터
  const [autoCompleteResults, setAutoCompleteResults] = useState<string[]>([]); // 자동완성 결과

  const [modal, setModal] = useState<boolean>(false);

  const handleOpenModal = () => {
    setModal(true);
  };

  const debouncedValue = useDebounce(value, 200);

  useEffect(() => {
    // 지역 정보 fetch
    const fetchRegions = async () => {
      const { data: response } = await axios.get('/regions.json');
      setRegions(response);
    };
    fetchRegions();
  }, []);

  useEffect(() => {
    // 자동완성 로직 debounce
    setAutoCompleteResults(autoComplete(regions, debouncedValue, 10));
  }, [debouncedValue, regions]);

  const handleGetCoords = async () => {
    // 좌표 -> 주소 변환 로직
    navigator.geolocation.getCurrentPosition(async (position) => {
      const response = await getAddressByCoords({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      });
      onChange({ target: { value: response } } as React.ChangeEvent<HTMLInputElement>);
    });
  };

  return (
    <>
      <SearchLabel
        labelTitle="지역"
        placeholder="지역을 입력해주세요."
        displayValue={value ? value : undefined}
        onClick={handleOpenModal}
        icon={<MapPin strokeWidth={1} size={28} stroke="#99a1af" />}
        error={fieldState.error}
        errorMessage={fieldState.error?.message}
      >
        <input type="text" value={value || ''} name={name} onChange={onChange} className="hidden" />
      </SearchLabel>

      <Modal isOpen={modal} onClose={() => setModal(false)} full>
        <ModalWrapper>
          <div className="md:min-h-[560px]">
            <ModalHeader onClick={() => setModal(false)} headerTitle="지역" />
            <div className="flex flex-col py-4">
              <CommonInput
                value={value}
                name={name}
                onChange={onChange}
                placeholder="지역을 검색하세요"
              />
              <button
                aria-label="내 위치"
                onClick={handleGetCoords}
                className="border-gray-primary flex cursor-pointer items-center gap-2 border-b py-3"
              >
                <LocateFixed stroke="#99a1af" strokeWidth={1} size={20} />
                <span className="text-sm text-gray-500">내 위치</span>
              </button>
              {autoCompleteResults.length > 0 && (
                <ul className="flex w-full flex-col gap-4 rounded-2xl py-4">
                  {autoCompleteResults.map((result) => (
                    <li
                      className="hover:text-primary-500 cursor-pointer bg-white transition-all"
                      key={result}
                      onClick={() =>
                        onChange({
                          target: { value: result },
                        } as React.ChangeEvent<HTMLInputElement>)
                      }
                    >
                      {result}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <PrimaryButton size="lg" onClick={() => setModal(false)} bold>
            완료
          </PrimaryButton>
        </ModalWrapper>
      </Modal>
    </>
  );
};

export default LocationInput;
