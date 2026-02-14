import React from 'react';
import type { FieldError } from 'react-hook-form';

interface SearchLabelProps {
  icon: React.ReactNode;
  displayValue?: string;
  placeholder: string;
  children: React.ReactNode;
  onClick: () => void;
  labelTitle: string;
  error?: FieldError;
  errorMessage?: string;
  className?: string;
}

const SearchLabel = ({
  icon,
  children,
  displayValue,
  placeholder,
  onClick,
  labelTitle,
  error,
  errorMessage,
  className,
}: SearchLabelProps) => {
  return (
    <label
      className={`${error ? 'border-error' : 'border-gray-primary'} hover:border-primary-400 cursor-pointer rounded-2xl border bg-white px-4 py-3 transition-colors md:flex-1 ${className}`}
    >
      {children}
      <div className="flex items-center gap-2" onClick={onClick}>
        {icon}
        <div>
          <div className="text-xs font-bold">{labelTitle}</div>
          <p
            className={`${error ? 'text-error' : displayValue ? 'text-black' : 'text-gray-500'} text-sm`}
          >
            {errorMessage || displayValue || placeholder}
          </p>
        </div>
      </div>
    </label>
  );
};

export default SearchLabel;
