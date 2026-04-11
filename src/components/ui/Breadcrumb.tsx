/**
 * Breadcrumb Component - Geek Gaming Center
 * Navigation breadcrumbs for product pages
 */

import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href: string;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-0.5 sm:space-x-2 text-sm overflow-x-auto pb-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <svg className="w-4 h-4 mx-0 sm:mx-2 text-white/40 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          )}
          {item.active ? (
            <span className="text-white/60 font-medium truncate">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className="text-white/50 hover:text-primary-400 transition-colors truncate"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
