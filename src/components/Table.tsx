'use client';

import { ReactNode } from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string | ((item: T) => string);
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
}

export default function Table<T>({ columns, data, loading }: TableProps<T>) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <thead className="bg-slate-50/50 text-left text-xs uppercase tracking-widest text-slate-500 dark:bg-slate-900/80 dark:text-slate-400">
            <tr>
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  className="px-6 py-4 font-semibold"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-transparent">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12">
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-3 h-8 w-8 animate-spin rounded-full border-r-2 border-t-2 border-indigo-500 border-transparent"></div>
                    <span className="text-sm font-medium text-slate-400 italic">Processing data...</span>
                  </div>
                </td>
              </tr>
            ) : !Array.isArray(data) || data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-300 dark:bg-slate-800">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium italic text-slate-400">No matches found for your criteria.</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-900/70"
                >
                  {columns.map((column, colIdx) => {
                    const cellClassName =
                      typeof column.className === 'function'
                        ? column.className(item)
                        : column.className || '';
                    return (
                      <td
                        key={colIdx}
                        className={`px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-200 whitespace-normal break-words ${cellClassName}`}
                      >
                        {typeof column.accessor === 'function'
                          ? column.accessor(item)
                          : (item[column.accessor] as ReactNode)}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
