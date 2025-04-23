import type { Metadata } from "next";
import localFont from "next/font/local";
import Header from "./components/Header";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
});

export const metadata: Metadata = {
  title: "프리시즘",
  description: "프리시즘 랜덤채팅",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${pretendard.className} ${pretendard.style} max-h-screen`}
      >
        <Header />
        <ToastContainer autoClose={2000} />
        {children}
      </body>
    </html>
  );
}
