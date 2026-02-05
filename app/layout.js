import "./globals.css";
import { Space_Grotesk, Work_Sans } from "next/font/google";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const heading = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading"
});

const body = Work_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body"
});

export const metadata = {
  title: "IndusLink | MSME Manufacturing Intelligence",
  description: "Structured machine discovery and decision support for Indian MSMEs."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body className="min-h-screen bg-steel-100 text-ink-900 flex flex-col">
        <Navbar />
        <main className="pt-16 flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
