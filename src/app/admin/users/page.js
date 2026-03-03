import AdminLayout from '@/components/admin/AdminLayout';
import UsersContent from '@/components/admin/UsersContent';

export const metadata = {
  title: 'Manage Users - Admin',
};

export default function UsersPage() {
  return (
    <AdminLayout>
      <UsersContent />
    </AdminLayout>
  );
}
