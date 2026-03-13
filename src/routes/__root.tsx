import { createRootRoute, Outlet, Link } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="px-6 py-4 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-gray-800 hover:opacity-80 transition-opacity">
          SQL Learning App
        </Link>
      </header>
      <main className="flex-1 bg-gray-50">
        <Outlet />
      </main>
      {/* <TanStackRouterDevtools /> */}
    </div>
  ),
})
