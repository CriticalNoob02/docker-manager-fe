import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/core/providers";
import { AppShell } from "@/shared/components/layout/AppShell";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Docker Manager",
  description: "Gerencie seus containers Docker localmente",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geist.className} antialiased`} suppressHydrationWarning>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
