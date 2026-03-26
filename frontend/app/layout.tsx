import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import SidebarWrapper from "@/components/SidebarWrapper";
import ThemeProvider from "@/components/ThemeProvider";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ticket Place",
  description: "Réservez vos billets pour les meilleurs événements",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${sora.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AuthProvider>
            <SidebarWrapper>{children}</SidebarWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
