import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GridX - Decentralized Energy Trading",
  description: "AI-powered peer-to-peer solar energy trading with blockchain verification",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <style>{`
          body { background-color: #0a0a0a !important; color: #00ff00 !important; font-family: sans-serif; }
          .min-h-screen { display: flex; flex-direction: column; min-height: 100vh; }
        `}</style>
      </head>
      <body className={`${inter.className} bg-primary text-gray-100`}>
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
