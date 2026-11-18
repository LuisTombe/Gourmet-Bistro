import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-[#f73b20] hover:bg-[#f84d35] text-white border border-transparent shadow-xs',
  secondary:
    'bg-[#fdedea] hover:bg-[#f73b20]/15 text-[#360802] border border-[#e7dcdb]',
};

const SIZE_CLASSES: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3.5 py-2 text-xs',
  md: 'px-4.5 py-2.5 text-[13px]',
  lg: 'px-6 py-3.5 text-[15px]',
};

export const Button: React.FC<ButtonProps> = React.memo(
  ({
    variant = 'primary',
    size = 'md',
    disabled = false,
    className = '',
    children,
    ...rest
  }) => {
    return (
      <button
        type="button"
        disabled={disabled}
        className={`inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

export default Button;
