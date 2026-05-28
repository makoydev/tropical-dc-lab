import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "TropicalDC Lab",
  description: "Interactive sustainability simulator for tropical data centres.",
};

const navItems = [
  { href: "/", label: "Home" },
  { href: "/simulator", label: "Simulator" },
  { href: "/compare", label: "Compare" },
  { href: "/recommendations", label: "Recommendations" },
  { href: "/learn", label: "Learn" },
  { href: "/report", label: "Report" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body>
        <nav className="sticky top-0 z-50 border-b border-[var(--line)] bg-white/88 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded bg-[var(--ink)] text-sm font-bold text-white">
                DC
              </span>
              <span className="font-semibold tracking-normal">TropicalDC Lab</span>
            </Link>
            <div className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => (
                <Link
                  className="rounded px-3 py-2 text-sm text-[var(--muted)] transition hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]"
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
