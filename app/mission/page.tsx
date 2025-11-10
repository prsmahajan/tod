import Link from "next/link";
import { Heart, DollarSign, Users, TrendingUp } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { ImpactDashboard } from "@/components/ImpactDashboard";
import { SubscriptionCalculator } from "@/components/SubscriptionCalculator";

export const metadata = {
  title: "Our Mission - Feeding Stray Animals in India | The Open Draft",
  description: "Every subscription helps feed hungry stray dogs, cats, cows, and birds across India. Learn how your ₹10/month makes a real difference.",
};

export default function MissionPage() {
  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        {/* Hero Section */}
        <section className="py-16 px-4 shadow-[0_10px_10px_-5px_rgba(255,255,255,0.5)]">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
              <Heart size={40} className="text-red-600 dark:text-red-400 fill-current" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-gray-100 font-serif">
              Every Subscription <span className="text-red-600 dark:text-red-400 font-hand">Feeds a Life</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed font-serif">
              We're not just another tech newsletter. We're a community that uses technology knowledge to feed hungry stray animals across India.
            </p>
          </div>
        </section>

        {/* The Problem */}
        <section className="py-12 px-4 bg-white dark:bg-[#1E1A1D]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center font-serif text-gray-900 dark:text-gray-100">The Reality We're Facing</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6 font-serif">
                Across India, millions of stray animals—dogs, cats, cows, bulls, and pigeons—struggle to survive on our streets.
                They face hunger, neglect, and harsh conditions every single day. Many go days without a proper meal.
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6 font-serif">
                These innocent creatures didn't choose this life. They depend on the compassion of humans to survive.
                But compassion alone isn't enough—we need <strong className="font-hand text-xl text-gray-900 dark:text-gray-100">action</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* Our Solution */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center font-serif text-gray-900 dark:text-gray-100">Our Solution: <span className="font-hand text-blue-600 dark:text-blue-400">Tech for Good</span></h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 md:p-12 border-2 border-blue-200 dark:border-blue-800">
              <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed mb-6 font-serif">
                <strong className="text-blue-600 dark:text-blue-400 font-hand text-xl">Here's the model:</strong> We create valuable technology content that people want to learn.
                You get knowledge about how things work in the tech world—clear, simple, in-depth articles.
              </p>
              <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed mb-6 font-serif">
                In return for just <strong className="text-3xl text-blue-600 dark:text-blue-400 font-hand">₹10 per month</strong>, you get access to premium content.
                But here's what makes this special: <strong className="font-hand text-xl text-gray-900 dark:text-gray-100">100% of subscription revenue (minus operational costs) goes directly to feeding stray animals.</strong>
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mt-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100 font-hand">The Math That Saves Lives:</h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300 font-serif">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    <span>20,000 subscribers × ₹10/month = <strong className="text-green-600 dark:text-green-400 font-hand text-xl">₹2,00,000/month</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    <span>After operational costs → <strong className="text-green-600 dark:text-green-400 font-hand text-xl">₹1,50,000+</strong> for animal food</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    <span>That's <strong className="text-green-600 dark:text-green-400 font-hand text-xl">thousands of meals</strong> every single month</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 px-4 bg-gray-50 dark:bg-[#211d20]">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center font-serif text-gray-900 dark:text-gray-100">How Your Subscription <span className="font-hand text-red-600 dark:text-red-400">Helps</span></h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-md text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                  <Users size={32} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">You Subscribe</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  For just ₹10/month, you get access to premium tech content that simplifies complex topics.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-md text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                  <DollarSign size={32} className="text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">We Collect Funds</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  All subscription revenue is pooled together, minus minimal operational costs.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-md text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                  <Heart size={32} className="text-red-600 dark:text-red-400 fill-current" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">Animals Get Fed</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  100% of proceeds buy food for stray dogs, cats, cows, bulls, and birds.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Calculator */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <SubscriptionCalculator />
          </div>
        </section>

        {/* Live Impact Dashboard */}
        <section className="py-12 px-4 bg-gray-50 dark:bg-[#211d20]">
          <div className="max-w-6xl mx-auto">
            <ImpactDashboard />
          </div>
        </section>

        {/* Transparency Pledge */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 dark:bg-gradient-to-r dark:from-[#1f1f1f] dark:to-[#444] rounded-2xl p-8 md:p-12 text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Our Transparency Pledge</h2>
              <div className="space-y-4 text-lg">
                <p className="flex items-start gap-3">
                  <span className="text-[#fff] font-bold">✓</span>
                  <span>Monthly public reports showing exactly how much was collected and spent</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-[#fff] font-bold">✓</span>
                  <span>Photos and videos of feeding sessions</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-[#fff] font-bold">✓</span>
                  <span>Real-time impact counter on our homepage</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-[#fff] font-bold">✓</span>
                  <span>Every rupee accounted for</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gradient-to-b from-white to-blue-50">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-serif dark:text-[#000]">
              Learn Tech. <span className="text-red-600 font-hand text-5xl">Feed Lives.</span>
            </h2>
            <p className="text-xl text-gray-700 mb-8 font-serif">
              Your <span className="font-hand text-2xl text-blue-600">₹10</span> subscription isn't just buying content—it's <span className="font-hand text-xl text-red-600">buying meals</span> for animals who have no one else.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/newsletter"
                className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
              >
                Read Free Articles
              </Link>
              <Link
                href="/subscribe"
                className="inline-block bg-red-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-700 transition"
              >
                Subscribe & Help Feed Animals
              </Link>
            </div>
            <p className="text-sm text-gray-600 mt-6">
              Not ready to subscribe? You can also make a <Link href="/donate" className="text-blue-600 underline">one-time donation</Link>
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center dark:text-[#000]">Common Questions</h2>
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-lg font-bold mb-2 dark:text-[#000]">How much of my subscription goes to animals?</h3>
                <p className="text-gray-700">
                  100% of revenue after minimal operational costs (hosting, email service, payment processing fees).
                  We're committed to keeping operations lean so maximum funds reach the animals.
                </p>
              </div>
              <div className="border-b pb-4">
                <h3 className="text-lg font-bold mb-2 dark:text-[#000]">Where are the animals located?</h3>
                <p className="text-gray-700">
                  We feed stray animals across various locations in India, focusing on areas with the highest need.
                  Monthly reports include locations and photos.
                </p>
              </div>
              <div className="border-b pb-4">
                <h3 className="text-lg font-bold mb-2 dark:text-[#000]">Can I cancel anytime?</h3>
                <p className="text-gray-700">
                  Yes, absolutely. No hard feelings. You can cancel your subscription anytime from your account settings.
                </p>
              </div>
              <div className="border-b pb-4">
                <h3 className="text-lg font-bold mb-2 dark:text-[#000]">What kind of content do I get?</h3>
                <p className="text-gray-700">
                  In-depth articles explaining how technology works—from web development to system design,
                  cloud computing to databases. Complex topics made simple and clear.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
