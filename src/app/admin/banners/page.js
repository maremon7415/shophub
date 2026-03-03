import AdminLayout from '@/components/admin/AdminLayout';
import BannersContent from '@/components/admin/BannersContent';

export const metadata = {
  title: 'Manage Banners - Admin',
};

export default function BannersPage() {
  return (
    <AdminLayout>
      <BannersContent />
    </AdminLayout>
  );
}
