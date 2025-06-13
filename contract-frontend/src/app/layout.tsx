import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ContractClauseAI - AI-Powered Contract Analysis",
  description:
    "Upload your contracts and get instant AI-powered analysis, risk assessment, and negotiation guidance. Streamline your legal review process with cutting-edge artificial intelligence.",
  keywords:
    "contract analysis, AI, legal tech, contract review, risk assessment, negotiation guidance",
  authors: [{ name: "ContractClauseAI Team" }],
  openGraph: {
    title: "ContractClauseAI - AI-Powered Contract Analysis",
    description:
      "Upload your contracts and get instant AI-powered analysis, risk assessment, and negotiation guidance.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ContractClauseAI - AI-Powered Contract Analysis",
    description:
      "Upload your contracts and get instant AI-powered analysis, risk assessment, and negotiation guidance.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
