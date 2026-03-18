import Navbar from '@/components/customer/Navbar';
import Footer from '@/components/customer/Footer';
import HeroSection from '@/components/customer/HeroSection';
import FeaturedProducts from '@/components/customer/FeaturedProducts';
import CategorySection from '@/components/customer/CategorySection';
import PromoSection from '@/components/customer/PromoSection';
import Testimonials from '@/components/customer/Testimonials';
import Newsletter from '@/components/customer/Newsletter';
import MobileBottomNav from '@/components/customer/MobileBottomNav';
import RecentProducts from '@/components/customer/RecentProducts';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <CategorySection />
      <FeaturedProducts />
      <PromoSection />
      <Testimonials />
      <RecentProducts />
      <Newsletter />
      <Footer />
      <MobileBottomNav />
    </main>
  );
}
