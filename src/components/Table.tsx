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
    <div className="bg-white border border-slate-100 shadow-premium rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/50 text-left">
            <tr>
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 bg-white">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12">
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-600 border-r-2 border-transparent mb-3"></div>
                    <span className="text-sm font-medium text-slate-400 italic">Processing data...</span>
                  </div>
                </td>
              </tr>
            ) : !Array.isArray(data) || data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                      </svg>
                    </div>
                    <span className="text-slate-400 text-sm font-medium italic">No matches found for your criteria.</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-slate-50/80 transition-colors group">
                  {columns.map((column, colIdx) => {
                    const cellClassName = typeof column.className === 'function' 
                      ? column.className(item) 
                      : column.className || '';
                    return (
                      <td key={colIdx} className={`px-6 py-5 whitespace-nowrap text-sm text-slate-600 font-medium ${cellClassName}`}>
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
