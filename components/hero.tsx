import Image from "next/image"
import { NewsletterForm } from "./newsletter-form"

export function Hero() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 py-10 sm:py-14">
      <div className="place-items-center">
        <Image
          src="/images/logo-dark.png"
          alt="The Open Draft logo"
          width={80}
          height={80}
          className="rounded-xl"
          priority
        />
      </div>

      <h1 className="text-balance text-center font-sans text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
        <span className="font-serif">Welcome to The Open Draft</span>
      </h1>

      <p className="text-pretty max-w-2xl text-center text-base leading-relaxed text-muted-foreground sm:text-lg">
        Helping you understand the technology that runs your systems, protects your data, and drives growth—so you can
        lead confidently in a digital world.
      </p>

      <NewsletterForm className="mt-2" />
    </section>
  )
}

export default Hero