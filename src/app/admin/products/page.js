import AdminLayout from '@/components/admin/AdminLayout';
import ProductsContent from '@/components/admin/ProductsContent';

export const metadata = {
  title: 'Products Management',
};

export default function ProductsPage() {
  return (
    <AdminLayout>
      <ProductsContent />
    </AdminLayout>
  );
}
