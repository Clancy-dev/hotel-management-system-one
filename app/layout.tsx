import type React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
// import { CurrencyProvider } from "@/context/CurrencyContext";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { CurrencyProvider } from "@/hooks/use-currency";
import { PolicyProvider } from "@/hooks/use-policy";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <PolicyProvider>
          <CurrencyProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
            <Toaster position="top-right" />
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>{children}</SidebarInset>
            </SidebarProvider>
          </ThemeProvider>
        </CurrencyProvider>
        </PolicyProvider>
        
      </body>
    </html>
  );
}

export const metadata = {
  generator: 'v0.dev'
};
