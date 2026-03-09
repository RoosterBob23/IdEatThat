import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SocketProvider } from "@/components/SocketProvider";
import KitchenThemeLayout from "@/components/KitchenThemeLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Id Eat That! - Chaotic Kitchen Card Game",
  description: "A fun and chaotic card game about food and sabotage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SocketProvider>
          <KitchenThemeLayout>
            {children}
          </KitchenThemeLayout>
        </SocketProvider>
      </body>
    </html>
  );
}
