import AdminLayout from '@/components/admin/AdminLayout';
import DashboardContent from '@/components/admin/DashboardContent';

export const metadata = {
  title: 'Admin Dashboard',
};

export default function DashboardPage() {
  return (
    <AdminLayout>
      <DashboardContent />
    </AdminLayout>
  );
}
