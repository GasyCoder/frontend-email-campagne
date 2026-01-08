import Nav from '@/components/Nav';

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Nav />
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white shadow-sm z-10">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-lg font-semibold text-gray-900 capitalize">
              {/* Title can be dynamic based on route if needed */}
              Admin Panel
            </h1>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
