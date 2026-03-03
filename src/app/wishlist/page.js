import Navbar from '@/components/customer/Navbar';
import Footer from '@/components/customer/Footer';
import WishlistContent from '@/components/customer/WishlistContent';

export const metadata = {
  title: 'My Wishlist',
};

export default function WishlistPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navbar />
      <div className="pt-24 pb-16">
        <WishlistContent />
      </div>
      <Footer />
    </main>
  );
}
