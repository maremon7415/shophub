import Navbar from '@/components/customer/Navbar';
import Footer from '@/components/customer/Footer';
import CartContent from '@/components/customer/CartContent';
import MobileBottomNav from '@/components/customer/MobileBottomNav';

export const metadata = {
  title: 'Shopping Cart',
};

export default function CartPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navbar />
      <div className="pt-24 pb-16">
        <CartContent />
      </div>
      <Footer />
      <MobileBottomNav />
    </main>
  );
}
