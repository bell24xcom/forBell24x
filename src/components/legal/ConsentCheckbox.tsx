'use client';

interface Props {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
  required?: boolean;
  /** Override for light-background contexts — default styling assumes a dark theme. */
  textClassName?: string;
}

/**
 * DPDP-compliant consent checkbox — never pre-ticked, requires affirmative action.
 */
export default function ConsentCheckbox({
  id,
  checked,
  onChange,
  children,
  required = true,
  textClassName = 'text-sm text-slate-300 group-hover:text-slate-200 leading-snug',
}: Props) {
  return (
    <label htmlFor={id} className="flex items-start gap-3 cursor-pointer group">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        required={required}
        className="mt-0.5 h-4 w-4 rounded border-slate-500 bg-slate-700 text-indigo-600
          focus:ring-indigo-500 focus:ring-2 focus:ring-offset-slate-900 flex-shrink-0"
      />
      <span className={textClassName}>
        {children}
      </span>
    </label>
  );
}
