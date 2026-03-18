import Navbar from '@/components/customer/Navbar';
import Footer from '@/components/customer/Footer';
import CartContent from '@/components/customer/CartContent';
import MobileBottomNav from '@/components/customer/MobileBottomNav';
import Breadcrumb from '@/components/customer/Breadcrumb';

export const metadata = {
  title: 'Shopping Cart',
};

export default function CartPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container">
          <Breadcrumb 
            items={[
              { label: 'Cart' }
            ]}
          />
          <CartContent />
        </div>
      </div>
      <Footer />
      <MobileBottomNav />
    </main>
  );
}
