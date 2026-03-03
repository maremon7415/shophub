import Navbar from '@/components/customer/Navbar';
import Footer from '@/components/customer/Footer';
import CollectionsContent from '@/components/customer/CollectionsContent';
import MobileBottomNav from '@/components/customer/MobileBottomNav';

export const metadata = {
  title: 'Shop All Products',
  description: 'Browse our complete collection of premium products',
};

export default function CollectionsPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navbar />
      <div className="pt-24 pb-16">
        <CollectionsContent />
      </div>
      <Footer />
      <MobileBottomNav />
    </main>
  );
}
