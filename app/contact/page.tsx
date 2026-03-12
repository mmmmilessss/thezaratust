import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="px-6 py-16 sm:px-10 sm:py-20 lg:px-12 lg:py-24">
      <section className="max-w-3xl">
        <h1 className="mb-6 text-xl sm:text-2xl">CONTACT</h1>
        <Link
          href="mailto:contact@zaratust.com"
          className="font-gotham-medium hover:opacity-60"
        >
          contact@zaratust.com
        </Link>
      </section>
    </main>
  );
}
