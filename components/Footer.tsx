import React from 'react';

const NAV_LINKS = [
  { name: "Impact", path: "/impact" },
  { name: "Mission", path: "/mission" },
  { name: "Support", path: "/support" },
  { name: "Articles", path: "/articles" },
];

const Footer: React.FC = () => {
  return (
    <footer className="bg-[var(--color-bg)] border-t border-[var(--color-border)] mt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-heading font-bold text-lg text-[var(--color-text-primary)]">tod;</h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">A community-driven initiative for animal welfare.</p>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-[var(--color-text-secondary)]">Navigate</h4>
            <ul className="mt-2 space-y-1">
              {NAV_LINKS.map(link => (
                 <li key={link.name}>
                    <a href={link.path} className="text-sm text-[var(--color-text-primary)] hover:underline">{link.name}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-[var(--color-text-secondary)]">Legal & Support</h4>
            <ul className="mt-2 space-y-1">
              <li><a href="/privacy" className="text-sm text-[var(--color-text-primary)] hover:underline">Privacy Policy</a></li>
              <li><a href="/terms" className="text-sm text-[var(--color-text-primary)] hover:underline">Terms & Conditions</a></li>
              <li><a href="/refund" className="text-sm text-[var(--color-text-primary)] hover:underline">Refund Policy</a></li>
              <li><a href="/contact" className="text-sm text-[var(--color-text-primary)] hover:underline">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-[var(--color-border)] pt-8 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">&copy; {new Date().getFullYear()} theopendraft.com. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
