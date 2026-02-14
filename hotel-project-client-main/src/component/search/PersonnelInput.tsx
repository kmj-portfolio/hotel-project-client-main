import { useState } from 'react';
import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Minus, Plus, User } from 'lucide-react';

import { PrimaryButton } from '../common/button/PrimaryButton';
import SearchLabel from '../common/label/SearchLabel';

import Modal from '../modal/Modal';
import ModalWrapper from '../modal/ModalWrapper';
import ModalHeader from '../modal/ModalHeader';

interface PersonnelInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  min?: number;
  max?: number;
}

const PersonnelInput = <T extends FieldValues>({
  name,
  control,
  min = 1,
  max = 10,
}: PersonnelInputProps<T>) => {
  const {
    field: { value, onChange },
    fieldState,
  } = useController({ name, control });
  const [modal, setModal] = useState<boolean>(false);
  const handleOpenModal = () => {
    setModal(true);
  };
  return (
    <>
      <SearchLabel
        error={fieldState.error}
        errorMessage={fieldState.error?.message}
        onClick={handleOpenModal}
        labelTitle="인원"
        displayValue={value ?? `성인 ${value}명`}
        placeholder="인원을 선택해주세요."
        icon={<User strokeWidth={1} size={28} stroke="#99a1af" />}
        className="md:max-w-[245px]"
      >
        <input
          type="number"
          value={value}
          name={name}
          onChange={onChange}
          className="hidden"
          min={1}
          max={10}
        />
      </SearchLabel>

      <Modal isOpen={modal} onClose={() => setModal(false)} full>
        <ModalWrapper>
          <div className="md:min-h-[200px]">
            <ModalHeader onClick={() => setModal(false)} headerTitle="인원" />
            <div className="flex items-center justify-between px-2 py-4">
              <span>성인</span>
              <div className="flex items-center gap-4">
                <button
                  className="bg-primary-500 flex cursor-pointer items-center justify-center rounded-full p-2 text-white"
                  onClick={() => {
                    if (Number(value) === max) return;
                    onChange({
                      target: { value: String(Number(value) + 1) },
                    } as React.ChangeEvent<HTMLInputElement>);
                  }}
                >
                  <Plus strokeWidth={2} size={20} />
                </button>
                <span>{value}</span>
                <button
                  className="bg-primary-500 flex cursor-pointer items-center justify-center rounded-full p-2 text-white"
                  onClick={() => {
                    if (Number(value) === min) return;

                    onChange({
                      target: { value: String(Number(value) - 1) },
                    } as React.ChangeEvent<HTMLInputElement>);
                  }}
                >
                  <Minus strokeWidth={2} size={20} />
                </button>
              </div>
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

export default PersonnelInput;
