import "@/globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import LayoutApp from "./layoutApp"


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Generate image",
  description: "Generate image"
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 }



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{typeof window === void 0?null:<LayoutApp>{children}</LayoutApp>}</body>
    </html>
  );
}
