import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Rand V Experience | Premium Barbering",
  description: "Elevate your look with The Rand V Experience. Premium barbering by appointment only.",
  keywords: ["barber", "haircut", "premium", "Los Angeles", "Rand V"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-matte-black min-h-screen">
        {children}
      </body>
    </html>
  );
}
