import AdminApp from '../admin/AdminApp';

// Unified Admin: Both /admin and /superadmin provide complete access to all controls.
export default function SuperAdminApp() {
  return <AdminApp />;
}
