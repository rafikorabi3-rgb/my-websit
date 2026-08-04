import Link from "next/link";
import { cairo } from "@/lib/fonts";
import "./globals.css";

export default function GlobalNotFound() {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center font-cairo text-fg antialiased">
        <p className="text-xs tracking-widest text-gold uppercase">404</p>
        <h1 className="text-2xl font-semibold">هذه الصفحة غير موجودة</h1>
        <p className="max-w-sm text-sm leading-relaxed text-fg-muted">
          الرابط الذي وصلت إليه غير صحيح، أو أن الصفحة أُزيلت.
        </p>
        <div className="mt-2 flex gap-4">
          <Link
            href="/"
            className="rounded-full bg-gold px-4 py-2 text-sm font-medium text-bg"
          >
            العودة للرئيسية
          </Link>
          <Link
            href="/en"
            className="rounded-full border border-line-strong px-4 py-2 text-sm text-fg-muted hover:text-gold"
          >
            English
          </Link>
        </div>
      </body>
    </html>
  );
}
