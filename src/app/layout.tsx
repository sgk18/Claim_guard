import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClaimGuard — Flag it before you pay it",
  description: "India-first, real-time expense verification and fraud-prevention platform for distributed field workforces.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-50 text-slate-900 antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}
