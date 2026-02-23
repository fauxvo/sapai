import { createRootRoute, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: () => (
    <div>
      <h1>SAP Integration Dashboard</h1>
      <Outlet />
    </div>
  ),
});
