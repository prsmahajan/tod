"use client";

import React, { useEffect, useState, useMemo } from 'react';
import AnimatedSection from '@/components/AnimatedSection';
import { useTypeText } from '@/hooks/useTypeText';
import Icon from '@/components/Icon';
import Marquee from '@/components/Marquee';
import Footer from '@/components/Footer';

interface FeaturedPhoto {
  id: string;
  imageUrl: string;
  description: string;
  userName: string;
  location?: string;
  feedDate: string;
  animalCount?: number;
}

const ImpactCard = ({ imageUrl, title, description, delay = 0 }: { imageUrl: string, title: string, description: string, delay?: number }) => (
  <div className="bg-[var(--color-card-bg)] rounded-lg overflow-hidden border border-[var(--color-border)] transition-shadow duration-300 hover:shadow-xl h-full animate-float" style={{ animationDelay: `${delay}s` }}>
    <img src={imageUrl} alt={title} className="w-full h-64 object-cover" />
    <div className="p-6">
      <h3 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">{title}</h3>
      <p className="mt-2 text-[var(--color-text-secondary)]">{description}</p>
    </div>
  </div>
);

const ApproachCard = ({ icon, title, description }: { icon: 'users' | 'shield' | 'heart', title: string, description: string }) => (
  <div className="bg-[var(--color-card-bg)] p-6 rounded-lg border border-[var(--color-border)]">
    <Icon name={icon} className="h-8 w-8 text-[var(--color-accent)]" />
    <h3 className="font-heading text-xl font-bold mt-4">{title}</h3>
    <p className="text-[var(--color-text-secondary)] mt-2 text-sm">{description}</p>
  </div>
);

const StoryCard = ({ imageUrl, name, story }: { imageUrl: string, name: string, story: string }) => (
  <div className="bg-[var(--color-card-bg)] rounded-lg overflow-hidden border border-[var(--color-border)]">
    <img src={imageUrl} alt={`Story of ${name}`} className="w-full h-72 object-cover" />
    <div className="p-6">
      <h3 className="font-heading text-2xl font-bold text-[var(--color-accent)]">{name}'s Story</h3>
      <p className="mt-3 text-[var(--color-text-secondary)] italic">"{story}"</p>
    </div>
  </div>
);

const marqueeImages = [
  "https://images.unsplash.com/photo-1679390974280-3899379f1c65?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1622905840442-47d9a953fec2?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1674802401345-4e6ec9fc2146?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1684937992798-ee66babd7e3a?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1651040618420-adb8081160e0?w=600&h=400&fit=crop",
  "https://plus.unsplash.com/premium_photo-1691031428727-3b8c7adfad37?w=600&h=400&fit=crop",
];

const ImpactPage: React.FC = () => {
  const animatedText = useTypeText(['Impact', 'Kindness', 'Care', 'Action'], 1500, 100);
  const [featuredPhotos, setFeaturedPhotos] = useState<FeaturedPhoto[]>([]);
  const [marqueeSpeed, setMarqueeSpeed] = useState(60);
  const MIN_SPEED = 1.5; // Faster (lower number = faster animation) - 3.5 seconds
  const MAX_SPEED = 120; // Slower (higher number = slower animation) - 120 seconds (2 minutes)
  const SPEED_STEP = 5;

  useEffect(() => {
    async function fetchFeaturedPhotos() {
      try {
        const response = await fetch('/api/photos/featured');
        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
          setFeaturedPhotos(data.photos);
        }
      } catch (error) {
        console.error('Error fetching featured photos:', error);
      }
    }

    fetchFeaturedPhotos();
  }, []);

  const increaseSpeed = () => {
    setMarqueeSpeed(prev => Math.max(MIN_SPEED, prev - SPEED_STEP));
  };

  const decreaseSpeed = () => {
    setMarqueeSpeed(prev => Math.min(MAX_SPEED, prev + SPEED_STEP));
  };

  // Combine featured photos (both admin and user) with static images
  // Memoize to prevent Marquee re-renders when animatedText changes
  const allMarqueeImages = useMemo(() => [
    ...featuredPhotos.map(p => ({
      src: p.imageUrl,
      userName: p.userName || 'Anonymous',
      isUser: true // Show name for all uploaded photos (admin and user)
    })),
    ...marqueeImages.map(src => ({ src, userName: '', isUser: false })),
  ], [featuredPhotos]);

  // Memoize marquee content to prevent re-renders
  const marqueeContent = useMemo(() =>
    allMarqueeImages.map((image, index) => (
      <figure key={index} className="relative group flex-shrink-0 m-0">
        <img
          src={image.src}
          alt={image.isUser ? `Photo by ${image.userName}` : `Stray animal ${index + 1}`}
          className="w-64 h-48 object-cover rounded-lg shadow-md flex-shrink-0"
          style={{ minWidth: '256px', width: '256px', height: '192px' }}
        />
        {image.isUser && image.userName && (
          <figcaption className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/80 to-transparent text-white text-xs rounded-b-lg">
            Posted by {image.userName}
          </figcaption>
        )}
      </figure>
    ))
  , [allMarqueeImages]);

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-24">
        <AnimatedSection>
          <header className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-[var(--color-text-primary)]">
              Real-World <span className="text-[var(--color-accent)]">{animatedText}</span>
            </h1>
            <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
              This isn't about grand gestures, but the consistent, daily effort of a community. Here's a look at the tangible differences being made every day.
            </p>
          </header>
        </AnimatedSection>

        <AnimatedSection>
          <div className="mt-20 -mx-4 sm:-mx-6 lg:-mx-8 relative">
            {/* Speed Controls */}
            <div className="absolute -top-12 right-4 sm:right-6 lg:right-8 flex gap-2 z-10">
              <button
                onClick={decreaseSpeed}
                disabled={marqueeSpeed >= MAX_SPEED}
                className="group relative w-8 h-8 rounded-full bg-[var(--color-card-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-all duration-200 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[var(--color-border)] disabled:hover:bg-[var(--color-card-bg)]"
                aria-label="Decrease speed"
              >
                <span className="text-lg font-bold leading-none">−</span>
                <span className="absolute -bottom-8 right-0 bg-[var(--color-text-primary)] text-[var(--color-bg)] text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Decrease speed
                </span>
              </button>
              <button
                onClick={increaseSpeed}
                disabled={marqueeSpeed <= MIN_SPEED}
                className="group relative w-8 h-8 rounded-full bg-[var(--color-card-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-all duration-200 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[var(--color-border)] disabled:hover:bg-[var(--color-card-bg)]"
                aria-label="Increase speed"
              >
                <span className="text-lg font-bold leading-none">+</span>
                <span className="absolute -bottom-8 right-0 bg-[var(--color-text-primary)] text-[var(--color-bg)] text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Increase speed
                </span>
              </button>
            </div>

            <Marquee speed={marqueeSpeed}>
              {marqueeContent}
            </Marquee>
          </div>
        </AnimatedSection>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <AnimatedSection direction="left">
            <ImpactCard
              imageUrl="https://picsum.photos/seed/feeding-impact/800/600"
              title="Feeding"
              description="Consistent meals for strays in multiple city zones, ensuring no animal goes hungry. We focus on nutritious food to help them regain strength and health."
            />
          </AnimatedSection>
          <AnimatedSection direction="right">
            <ImpactCard
              imageUrl="https://picsum.photos/seed/shelter-impact/800/600"
              title="Shelter"
              description="Building and maintaining temporary, safe shelters to protect animals from harsh weather and street dangers, giving them a safe space to rest and recover."
              delay={0.5}
            />
          </AnimatedSection>
          <AnimatedSection direction="left">
            <ImpactCard
              imageUrl="https://picsum.photos/seed/care-impact/800/600"
              title="Care"
              description="Providing essential medical care, from first-aid for injuries to vaccinations and sterilization, with the help of volunteer vets and local clinics."
            />
          </AnimatedSection>
          <AnimatedSection direction="right">
            <ImpactCard
              imageUrl="https://picsum.photos/seed/awareness-impact/800/600"
              title="Awareness"
              description="Running local awareness campaigns to educate the public about the importance of compassion towards stray animals and responsible pet ownership."
              delay={0.5}
            />
          </AnimatedSection>
        </div>

        <AnimatedSection className="mt-32">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-[var(--color-text-primary)]">Success Stories</h2>
            <p className="mt-3 text-[var(--color-text-secondary)]">Behind every number is a life changed. Here are a few of them.</p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <AnimatedSection direction="left">
              <StoryCard
                name="Raja"
                imageUrl="https://picsum.photos/seed/raja-dog/800/600"
                story="Found with a severe leg injury, Raja was timid and mistrustful. Through community-funded treatment and the patient care of a local volunteer, he's now a happy, healthy dog who loves to play, reminding us that every animal deserves a second chance."
              />
            </AnimatedSection>
            <AnimatedSection direction="right">
              <StoryCard
                name="Misty"
                imageUrl="https://picsum.photos/seed/misty-cat/800/600"
                story="A litter of kittens was found abandoned in a construction site. Our network quickly organized to provide them with a safe, temporary shelter and nutritious food. Misty, the bravest of the bunch, was the first to find her forever home."
              />
            </AnimatedSection>
          </div>
        </AnimatedSection>

        <AnimatedSection className="mt-32">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-[var(--color-text-primary)]">How We're Different</h2>
            <p className="mt-3 text-[var(--color-text-secondary)]">We believe in direct, transparent, and compassionate action.</p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <AnimatedSection>
              <ApproachCard icon="users" title="Community-Powered" description="We are a network of volunteers and supporters. Every action is driven by the community, for the community." />
            </AnimatedSection>
            <AnimatedSection>
              <ApproachCard icon="shield" title="Radical Transparency" description="Every contribution is tracked and accounted for. You'll see the direct impact of your support in real-time updates." />
            </AnimatedSection>
            <AnimatedSection>
              <ApproachCard icon="heart" title="On-the-Ground Action" description="We focus on immediate, practical help—providing food, water, and care where it's needed most, right now." />
            </AnimatedSection>
          </div>
        </AnimatedSection>

        <AnimatedSection className="mt-32">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-[var(--color-card-bg)] p-8 rounded-lg border border-[var(--color-border)]">
            <div className="order-2 md:order-1">
              <h2 className="font-heading text-3xl font-extrabold text-[var(--color-text-primary)]">A Glimpse Into Our Day</h2>
              <p className="mt-4 text-[var(--color-text-secondary)]">
                It starts with a morning round, checking on familiar furry faces. A volunteer in Delhi fills water bowls, another in Mumbai provides a meal to a litter of kittens. Later, a call comes in about an injured dog. Resources are pooled instantly, and a local volunteer helps get the dog to a nearby clinic. The day ends with photos and updates shared back to our supporters. It's simple, direct, and it happens every single day, thanks to people like you.
              </p>
              <a href="#/mission" className="inline-block mt-6 px-5 py-2 text-sm font-medium rounded-full bg-[var(--color-text-primary)] text-[var(--color-bg)] hover:opacity-90 transition-opacity">
                Read Our Mission
              </a>
            </div>
            <div className="order-1 md:order-2">
              <img src="https://picsum.photos/seed/volunteer-with-dog/800/600" alt="Volunteer with a stray dog" className="rounded-lg object-cover w-full h-full" />
            </div>
          </div>
        </AnimatedSection>
      </div>
      <Footer />
    </>
  );
};

export default ImpactPage;
