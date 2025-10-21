import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Simplexity Clone - AI Search Assistant",
  description: "Search and get AI-powered answers with citations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
