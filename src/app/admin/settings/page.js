import AdminLayout from '@/components/admin/AdminLayout';
import SettingsContent from '@/components/admin/SettingsContent';

export const metadata = {
  title: 'Admin Settings',
};

export default function SettingsPage() {
  return (
    <AdminLayout>
      <SettingsContent />
    </AdminLayout>
  );
}
