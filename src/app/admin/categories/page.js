import AdminLayout from '@/components/admin/AdminLayout';
import CategoriesContent from '@/components/admin/CategoriesContent';

export const metadata = {
  title: 'Categories Management',
};

export default function CategoriesPage() {
  return (
    <AdminLayout>
      <CategoriesContent />
    </AdminLayout>
  );
}
