import type { Metadata } from "next";
import { Inter } from "next/font/google";
// @ts-ignore
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "./_components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Save & Organize URLs",
  description: "Easily save, organize, and access your important URLs with custom categories.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="">

        
        <Providers><Navbar/>
        <div className="mt-9">
          
           {children}
          </div>
          </Providers>
        </div>
      </body>
    </html>
  );
}