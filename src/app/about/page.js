import Navbar from '@/components/customer/Navbar';
import Footer from '@/components/customer/Footer';

export const metadata = {
  title: 'About Us',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold font-display text-center mb-8">About ShopHub</h1>
            
            <div className="bg-white rounded-2xl shadow-card p-8 mb-8">
              <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                ShopHub was founded with a simple mission: to provide a premium shopping experience 
                that combines quality products with exceptional customer service. Since our inception, 
                we've been dedicated to curating the finest selection of products across various categories.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We believe in sustainable shopping practices and ethical business operations. 
                Our platform connects customers with trusted suppliers who share our commitment to quality and integrity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-card p-6 text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-accent">10K+</span>
                </div>
                <h3 className="font-semibold">Happy Customers</h3>
              </div>
              <div className="bg-white rounded-xl shadow-card p-6 text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-accent">500+</span>
                </div>
                <h3 className="font-semibold">Products</h3>
              </div>
              <div className="bg-white rounded-xl shadow-card p-6 text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-accent">50+</span>
                </div>
                <h3 className="font-semibold">Categories</h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-card p-8">
              <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2" />
                  <span className="text-gray-600">Quality First - We never compromise on product quality</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2" />
                  <span className="text-gray-600">Customer Satisfaction - Your happiness is our priority</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2" />
                  <span className="text-gray-600">Secure Shopping - Your data is always protected</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2" />
                  <span className="text-gray-600">Fast Shipping - Get your orders delivered quickly</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
