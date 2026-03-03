import AdminLayout from '@/components/admin/AdminLayout';
import CouponsContent from '@/components/admin/CouponsContent';

export const metadata = {
  title: 'Manage Coupons - Admin',
};

export default function CouponsPage() {
  return (
    <AdminLayout>
      <CouponsContent />
    </AdminLayout>
  );
}
