import { useState } from 'react';

import 'react-day-picker/style.css';

import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';
import { DayPicker, getDefaultClassNames } from 'react-day-picker';
import { ko } from 'date-fns/locale/ko';
import { Calendar } from 'lucide-react';

import { PrimaryButton } from '../common/button/PrimaryButton';
import SearchLabel from '../common/label/SearchLabel';

import Modal from '../modal/Modal';
import ModalWrapper from '../modal/ModalWrapper';
import ModalHeader from '../modal/ModalHeader';
import { formatDateToISOstring } from '@/utils/format/formatUtil';

interface CustomRange {
  from: Date | undefined;
  to?: Date | undefined;
}

function isSameDay(a?: Date, b?: Date) {
  return (
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

interface DateInputProps<T extends FieldValues> {
  checkInName: Path<T>;
  checkOutName: Path<T>;
  control: Control<T>;
}

const DateInput = <T extends FieldValues>({
  checkInName,
  checkOutName,
  control,
}: DateInputProps<T>) => {
  const {
    field: { onChange: handleChangeCheckIn, value: checkInValue },
    fieldState: checkInState,
  } = useController({ name: checkInName, control });
  const {
    field: { onChange: handleChangeCheckOut, value: checkOutValue },
    fieldState: checkOutState,
  } = useController({ name: checkOutName, control });

  const [modal, setModal] = useState<boolean>(false);

  const [selected, setSelected] = useState<CustomRange>({
    from: checkInValue ? new Date(checkInValue) : undefined,
    to: checkOutValue ? new Date(checkOutValue) : undefined,
  });

  const handleDayClick = (day: Date) => {
    const { from, to } = selected;
    const formattedDate = formatDateToISOstring(day);
    if (!from && !to) {
      setSelected({ from: day, to: undefined });
      handleChangeCheckIn(formattedDate);
      handleChangeCheckOut('');

      return;
    }

    if (from && !to) {
      if (isSameDay(from, day)) return;

      if (day < from) {
        setSelected({ from: day, to: undefined });
        handleChangeCheckIn(formattedDate);
        handleChangeCheckOut('');

        return;
      }

      setSelected({ from, to: day });
      handleChangeCheckOut(formattedDate);
      return;
    }

    setSelected({ from: day, to: undefined });

    handleChangeCheckIn(formattedDate);
    handleChangeCheckOut('');
  };

  const defaultClassNames = getDefaultClassNames();

  const modifiers = {
    from: selected?.from,
    to: selected?.to,
    range:
      selected && selected.from && selected.to
        ? { from: selected.from, to: selected.to }
        : undefined,
  };

  const modifiersClassNames = {
    month: 'fill-primary-500',
    today: 'text-black',
    selected: 'border-0',
    from: `bg-primary-500 text-white  transition-colors rounded-l-full`,
    to: 'bg-primary-500 text-white rounded-r-full  transition-colors',
    range: 'bg-primary-300/70 transition-colors text-white',
  };

  return (
    <>
      <SearchLabel
        onClick={() => setModal(true)}
        labelTitle="날짜"
        icon={<Calendar strokeWidth={1} size={28} stroke="#99a1af" />}
        placeholder="날짜를 선택해주세요."
        error={checkInState.error || checkOutState.error}
        errorMessage={checkInState.error?.message || checkOutState.error?.message}
        displayValue={
          checkInValue && checkOutValue ? `${checkInValue} ~ ${checkOutValue}` : undefined
        }
        className="md:max-w-[245px]"
      >
        <input
          type="date"
          value={selected.from ? selected.from.toISOString().slice(0, 10) : ''}
          name={checkInName}
          onChange={(e) => handleChangeCheckIn(e.target.value)}
          className="hidden"
        />
        <input
          type="date"
          value={selected.to ? selected.to.toISOString().slice(0, 10) : ''}
          name={checkOutName}
          onChange={(e) => handleChangeCheckOut(e.target.value)}
          className="hidden"
        />
      </SearchLabel>

      {modal && (
        <Modal isOpen={modal} onClose={() => setModal(false)} full>
          <ModalWrapper>
            <div>
              <ModalHeader onClick={() => setModal(false)} headerTitle="날짜" />
              <div className="py-4">
                <DayPicker
                  locale={ko}
                  navLayout="around"
                  mode="single"
                  selected={selected?.from}
                  onDayClick={handleDayClick}
                  modifiers={modifiers}
                  modifiersClassNames={modifiersClassNames}
                  classNames={{
                    months: 'w-full',
                    month_grid: 'w-full',
                    day: `${defaultClassNames.day} cursor-pointer w-full`,
                    day_button: 'w-full h-full cursor-pointer',
                  }}
                />
              </div>
            </div>

            <PrimaryButton size="lg" onClick={() => setModal(false)} bold>
              선택완료
            </PrimaryButton>
          </ModalWrapper>
        </Modal>
      )}
    </>
  );
};

export default DateInput;
