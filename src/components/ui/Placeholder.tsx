import type { ButtonHTMLAttributes, ReactNode } from 'react';

type PlaceholderProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export default function Placeholder({
  children,
  className = '',
  ...props
}: PlaceholderProps) {
  return (
    <button
      type="button"
      className={`link-button ${className}`}
      disabled
      {...props}
    >
      {children}
    </button>
  );
}
