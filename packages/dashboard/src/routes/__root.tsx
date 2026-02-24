import { createRootRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-14 items-center gap-6">
            <span className="text-lg font-semibold text-gray-900">SAPAI</span>
            <Link
              to="/"
              className="text-sm text-gray-600 hover:text-gray-900 [&.active]:font-medium [&.active]:text-blue-600"
            >
              Dashboard
            </Link>
            <Link
              to="/agent"
              search={{}}
              className="text-sm text-gray-600 hover:text-gray-900 [&.active]:font-medium [&.active]:text-blue-600"
            >
              Agent
            </Link>
            <Link
              to="/agent/history"
              className="text-sm text-gray-600 hover:text-gray-900 [&.active]:font-medium [&.active]:text-blue-600"
            >
              Audit Log
            </Link>
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  ),
});
