"use client";

import { Quote, Star } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Priya Sharma",
    role: "Software Engineer",
    content: "The Open Draft makes learning tech concepts so easy! And knowing that my subscription helps feed stray animals makes it even more meaningful.",
    rating: 5,
  },
  {
    id: "2",
    name: "Rahul Verma",
    role: "Product Manager",
    content: "I've tried many tech blogs, but this one stands out. Clear explanations, practical examples, and a mission I'm proud to support.",
    rating: 5,
  },
  {
    id: "3",
    name: "Ananya Desai",
    role: "Data Scientist",
    content: "Finally, a platform that combines quality tech content with social impact. I love seeing the updates about the animals we help!",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Our Community Says 💬
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of tech enthusiasts making a difference
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow relative"
            >
              {/* Quote icon */}
              <div className="absolute top-6 right-6 text-purple-200">
                <Quote size={32} />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-12">
          <p className="text-lg text-gray-700 mb-4">
            Ready to join our mission?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/login"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
            >
              Start Your Journey
            </a>
            <a
              href="/articles"
              className="inline-block bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all shadow-lg border-2 border-gray-200"
            >
              Read Free Articles
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
