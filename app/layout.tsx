import { Inter } from "next/font/google";
import { MetadataRoute } from "next/server";
import type { MetadataRoute } from "next/server";

import "./globals.css";
import { Toaster } from "@/app/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

export const metadata: MetadataRoute = {
  title: "Create Next App",
  description: "Generated by create next app",
};

