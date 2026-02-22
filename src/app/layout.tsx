import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Furniture Store | Premium Home Furnishings',
  description: 'Discover exquisite furniture pieces for your home.',
};

// Root layout is minimal - actual layout is in [locale]/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
