// app/layout.tsx
import "./globals.css";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";
import Providers from "./components/Providers";
import AuthCheck from "./components/AuthCheck";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body>
        <Providers session={session}>
          <AuthCheck>{children}</AuthCheck>
        </Providers>
      </body>
    </html>
  );
}