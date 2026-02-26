import { createRootRoute, Link, Outlet } from '@tanstack/react-router';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

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
              className="text-sm text-gray-600 hover:text-gray-900 [&.active]:font-medium [&.active]:text-blue-600"
            >
              Pipeline Runs
            </Link>
            <Link
              to="/agent/history"
              className="text-sm text-gray-600 hover:text-gray-900 [&.active]:font-medium [&.active]:text-blue-600"
            >
              Audit Log
            </Link>
            <div className="ml-auto">
              <a
                href={`${apiBaseUrl}/docs`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
              >
                API Docs
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  ),
});
