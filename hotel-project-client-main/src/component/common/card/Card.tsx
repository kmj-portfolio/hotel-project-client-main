import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  divider?: boolean;
}

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  divider?: boolean;
  alignment?: string;
}

export const Card = ({ children, className = '', ...props }: CardProps) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({
  children,
  className = '',
  divider = true,
  ...props
}: CardHeaderProps) => {
  const headerClasses = `mb-4 ${divider ? 'border-b border-gray-200 pb-4' : ''} ${className}`;

  return (
    <div className={headerClasses} {...props}>
      {children}
    </div>
  );
};

const CardContent = ({ children, className = '', ...props }: CardContentProps) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({
  children,
  className = '',
  divider = true,
  alignment = 'text-right',
  ...props
}: CardFooterProps) => {
  const footerClasses = `mt-4 pt-4' ${divider ? 'pt-4 border-t border-dashed border-blue-600' : ''} ${alignment} ${className}`;

  return (
    <>
      {divider ? (
        <div className={footerClasses} {...props}>
          {children}
        </div>
      ) : (
        <>
          <div className={footerClasses} {...props}></div>
          <div> {children} </div>
        </>
      )}
    </>
  );
};

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
