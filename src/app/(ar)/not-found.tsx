import Link from "next/link";

export default function ArabicNotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-5 py-32 text-center">
      <p className="text-xs tracking-widest text-gold uppercase">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-fg">
        هذه الصفحة غير موجودة
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-fg-muted">
        الرابط الذي وصلت إليه غير صحيح، أو أن الصفحة أُزيلت.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-bg"
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}
