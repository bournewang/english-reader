import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NavigationWrapper } from "@/components/NavigationWrapper";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "English Reader",
  description: "Read and learn English with interactive tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* <NavigationWrapper /> */}
        {children}
      </body>
    </html>
  );
} 