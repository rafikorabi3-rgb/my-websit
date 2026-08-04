import Link from "next/link";

export default function EnglishNotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-5 py-32 text-center">
      <p className="text-xs tracking-widest text-gold uppercase">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-fg">Page not found</h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-fg-muted">
        The link you followed is broken, or the page has been removed.
      </p>
      <Link
        href="/en"
        className="mt-6 rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-bg"
      >
        Back home
      </Link>
    </div>
  );
}
