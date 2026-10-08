import { AdminView } from "@/components/admin/admin-view";

/**
 * Admin management page component for route `/admin`.
 *
 * Restricted to users with `admin` role. Non-admin users are automatically
 * redirected to `/feed`.
 *
 * @returns The admin management dashboard view.
 */
export default function AdminPage() {
  return <AdminView />;
}
