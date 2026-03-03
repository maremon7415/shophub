import AdminLayout from '@/components/admin/AdminLayout';
import OrdersContent from '@/components/admin/OrdersContent';

export const metadata = {
  title: 'Orders Management',
};

export default function OrdersPage() {
  return (
    <AdminLayout>
      <OrdersContent />
    </AdminLayout>
  );
}
