import { ReactNode, clsx, NextLink } from '@app/utilities/deps';

interface Props {
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  color: 'primary' | 'danger' | 'light' | 'dark';
  size: 'xs' | 'sm' | 'md';
  href?: string;
  disabled?: boolean;
}

const colors = {
  primary: clsx('bg-primary-600 text-white hover:bg-primary-500 disabled:bg-primary-400'),
  danger: clsx('bg-danger-600 text-white hover:bg-danger-500 disabled:bg-danger-400'),
  dark: clsx('bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-700'),
  light: clsx('bg-gray-100 text-white hover:bg-gray-200 disabled:bg-gray-300'),
};

const sizes = {
  xs: clsx('py-1 px-2 text-xs'),
  sm: clsx('py-2 px-3 text-sm'),
  md: clsx('py-3 px-4 text-base'),
};

export function Button(props: Props) {
  if (props.href) {
    return (
      <NextLink
        href={props.href}
        className={clsx(
          'pointer-events-auto rounded-md font-semibold leading-5',
          colors[props.color],
          sizes[props.size],
          props.className
        )}
      >
        {props.children}
      </NextLink>
    );
  }

  return (
    <button
      onClick={props.onClick}
      className={clsx(
        'pointer-events-auto rounded-md font-semibold leading-5 ',
        colors[props.color],
        sizes[props.size],
        props.className
      )}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
}
