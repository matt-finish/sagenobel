import type { Metadata } from "next";
import { DM_Sans, Bodoni_Moda, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/components/cart/cart-provider";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const bodoni = Bodoni_Moda({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Sage Nobel",
    template: "%s | Sage Nobel",
  },
  description:
    "Curating experiences and environments — travel, hosting, home decor, and inspiration for intentional living.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${bodoni.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
