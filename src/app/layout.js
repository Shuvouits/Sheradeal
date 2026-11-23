import "./globals.css";
import SiteChrome from "@/components/layout/SiteChrome";

export const metadata = {
  title: "SheraDeal | Online Shopping in Bangladesh",
  description: "Shop your favorite products at SheraDeal Bangladesh.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
