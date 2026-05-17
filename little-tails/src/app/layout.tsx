import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Little Tails Pet Clinic - Vet Care With Heart | Zaheerabad",
  description: "Little Tails Pet Clinic by Dr. Ganesh Kumar (B.V.Sc & A.H) - Pet Care, Pet Food & Pet Accessories. Committed to Pet Wellness. Near Adarsh Nagar Gate, Zaheerabad.",
  keywords: "Little Tails Pet Clinic, veterinary clinic Zaheerabad, Dr Ganesh Kumar, pet care, pet food, pet accessories, vaccination, grooming, pet health",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
