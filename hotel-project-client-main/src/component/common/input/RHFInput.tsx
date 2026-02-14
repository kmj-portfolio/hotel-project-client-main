import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';

import CommonInput from './CommonInput';

// 제네릭 FieldValues 확장, value 속성 Omit
interface RHFInputProps<T extends FieldValues>
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'> {
  name: Path<T>;
  label?: string;
  control: Control<T>;
  type?: string;
}

const RHFInput = <T extends FieldValues>({
  name,
  label,
  control,
  type = 'text',
  ...rest
}: RHFInputProps<T>) => {
  const { field, fieldState } = useController({ name, control });

  return (
    <CommonInput
      type={type}
      onChange={field.onChange}
      value={field.value ?? ''}
      name={name}
      label={label}
      error={fieldState.error as unknown as boolean}
      errorMessage={fieldState.error?.message}
      {...rest}
    />
  );
};

export default RHFInput;
