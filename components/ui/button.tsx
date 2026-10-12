import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[background-color,color,border-color,transform] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:pointer-events-none disabled:opacity-60 active:translate-y-px',
  {
    variants: {
      variant: {
        coral: 'bg-coral text-ink hover:bg-[#f0957f]',
        light: 'bg-white text-brand hover:bg-mint',
        outline:
          'border border-[#3d5a4e] text-white hover:border-[#5d8a76] hover:bg-white/5',
        solid: 'bg-brand text-white hover:bg-[#1d5f49]',
      },
      size: {
        sm: 'min-h-11 px-5 text-[15px]',
        md: 'min-h-12 px-[26px] text-base',
        lg: 'min-h-14 px-9 text-lg',
      },
    },
    defaultVariants: { variant: 'coral', size: 'md' },
  },
);

type OwnProps = VariantProps<typeof buttonVariants> & {
  className?: string;
  href?: string;
};

export type ButtonProps = OwnProps &
  Omit<React.ComponentPropsWithoutRef<'a'>, 'className'> &
  Omit<React.ComponentPropsWithoutRef<'button'>, 'className'>;

export function Button({
  className,
  variant,
  size,
  href,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);

  // A control that changes state on the page is a button; one that navigates is
  // a link. Getting this wrong breaks keyboard and screen-reader behaviour.
  if (href) {
    return (
      <a
        href={href}
        className={classes}
        {...(rest as React.ComponentPropsWithoutRef<'a'>)}
      />
    );
  }

  return (
    <button
      type={type}
      className={classes}
      {...(rest as React.ComponentPropsWithoutRef<'button'>)}
    />
  );
}

export { buttonVariants };
