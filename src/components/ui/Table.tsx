import type { HTMLAttributes, TableHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function TableContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60',
        className
      )}
      {...props}
    />
  );
}

export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('min-w-[900px] w-full text-sm', className)} {...props} />
    </div>
  );
}

export function TableHead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        'bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-900/80 dark:text-slate-400',
        className
      )}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn('border-b border-slate-200 dark:border-slate-800', className)}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn('px-4 py-3 text-slate-700 dark:text-slate-200 whitespace-normal break-words', className)}
      {...props}
    />
  );
}

export function TableHeaderCell({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn('px-4 py-3 font-semibold text-slate-600 dark:text-slate-300', className)}
      {...props}
    />
  );
}
