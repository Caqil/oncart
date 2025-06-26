import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Setup - OnCart",
  description: "Set up your OnCart multi-vendor ecommerce platform",
  robots: "noindex, nofollow",
};

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
