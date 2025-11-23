'use client';

export function Header() {
  return (
    <header className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Pet Supplies Store</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Admin</span>
        </div>
      </div>
    </header>
  );
}
