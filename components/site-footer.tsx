import { NewsletterForm } from "./newsletter-form"

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-border bg-background">
      <div className="container mx-auto px-4 py-10">
        <div className="grid items-start gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="font-sans text-2xl font-semibold sm:text-3xl">
              <span className="font-serif">The Open Draft</span>
            </h3>
            <p className="max-w-lg text-muted-foreground">
              Explore our latest news that no one is covering, but we do.
            </p>
          </div>
          <div className="md:justify-self-end">
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground md:flex-row">
          <p>© 2025 The Open Draft.</p>
          <nav className="flex gap-6">
            <a href="#" className="hover:underline">
              Privacy policy
            </a>
            <a href="#" className="hover:underline">
              Terms of use
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
