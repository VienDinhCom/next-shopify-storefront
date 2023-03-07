import { ReactNode, clsx } from '@app/utilities/deps';

interface Props {
  onClick?: () => void;
  children: ReactNode;
  color: 'primary';
  size: 'xs' | 'sm' | 'md';
}

export function Button(props: Props) {
  const colors = {
    primary: {
      default: {
        color: 'text-white',
        background: 'bg-primary-600',
      },
      hover: {
        color: 'text-white',
        background: 'hover:bg-primary-500',
      },
    },
  };

  const sizes = {
    xs: 'py-1 px-2 text-xs',
    sm: 'py-2 px-3 text-sm',
    md: 'py-3 px-4 text-base',
  };

  return (
    <button
      onClick={props.onClick}
      className={clsx(
        'pointer-events-auto rounded-md font-semibold leading-5',
        colors[props.color].default.color,
        colors[props.color].default.background,
        colors[props.color].hover.color,
        colors[props.color].hover.background,
        sizes[props.size]
      )}
    >
      {props.children}
    </button>
  );
}
