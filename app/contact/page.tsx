import Link from "next/link";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Contact",
  description: "Contact ZARATUST, the Seoul-based multidisciplinary creative practice of PARK GEON WOO.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main className="px-6 py-16 sm:px-10 sm:py-20 lg:px-12 lg:py-24">
      <section className="max-w-3xl">
        <h1 className="mb-6 text-xl sm:text-2xl">CONTACT</h1>
        <Link
          href="mailto:contact@zaratust.com"
          className="font-gotham-medium transition-opacity hover:opacity-60"
        >
          contact@zaratust.com
        </Link>
      </section>
    </main>
  );
}
