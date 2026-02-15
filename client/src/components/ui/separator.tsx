interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Separator({ orientation = 'horizontal', className = '' }: SeparatorProps) {
  return (
    <div
      className={`${
        orientation === 'horizontal' ? 'h-px w-full bg-gray-200' : 'w-px h-full bg-gray-200'
      } ${className}`}
    />
  );
}

export default Separator;
