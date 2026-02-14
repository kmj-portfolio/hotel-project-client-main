interface RadioInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'md' | 'lg'; // default -> md
  label: string;
  name: string;
  id: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  checked: boolean;
}

const RadioInput = ({
  label,
  size = 'md',
  name,
  id,
  checked,
  onChange,
  ...rest
}: RadioInputProps) => {
  const getRadioInputStyle = (size: 'md' | 'lg') => {
    let defaultStyle =
      'bg-gray-primary has-checked:bg-primary-500 block rounded-full text-white transition-colors duration-100 cursor-pointer font-bold ';

    switch (size) {
      case 'md':
        return (defaultStyle += 'px-5 py-1.5 text-sm');
      case 'lg':
        return (defaultStyle += 'px-8 py-2 text-base');
    }
  };

  return (
    <label htmlFor={id} className={getRadioInputStyle(size)}>
      {label}

      <input
        type="radio"
        name={name}
        id={id}
        checked={checked}
        onChange={onChange}
        className="hidden"
        {...rest}
      />
    </label>
  );
};

export default RadioInput;
