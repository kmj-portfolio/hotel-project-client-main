import React from 'react';

interface TextProps {
  children: React.ReactNode;
  size?: string;
  color?: 'primary' | 'sub';
  className?: string;
  align?: 'left' | 'center' | 'right';
}

const Text = ({
  children,
  size = 'text-base',
  color = 'primary',
  className = '',
  align = 'left',
}: TextProps) => {
  const colorClassMap = {
    primary: 'text-black',
    sub: 'text-gray-primary',
  };

  const alignClassMap = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={`${size} ${colorClassMap[color]} ${alignClassMap[align]} ${className}`}>
      {children}
    </div>
  );
};

export default Text;