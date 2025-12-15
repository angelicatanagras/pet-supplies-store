'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/pos', label: 'Point of Sale', icon: '💰' },
  { href: '/dashboard/products', label: 'Products', icon: '🛍️' },
  { href: '/dashboard/orders', label: 'Orders', icon: '🧾' },
  { href: '/dashboard/customers', label: 'Customers', icon: '👥' },
  { href: '/grooming', label: 'Grooming', icon: '✂️' },
  { href: '/inventory', label: 'Inventory', icon: '📦' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-xl font-bold">Pet Supplies Store</h1>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-2 p-2 rounded hover:bg-gray-700 ${
                  pathname === item.href || pathname.startsWith(item.href + '/') ? 'bg-gray-700' : ''
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="flex items-center gap-2 p-2 rounded hover:bg-gray-700 text-red-400 mt-auto"
      >
        <span>🚪</span>
        Logout
      </button>
    </aside>
  );
}
