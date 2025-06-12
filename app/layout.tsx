"use client"

import "./globals.css"
import { Inter } from "next/font/google"
import { NotificationProvider } from "@/components/notifications/NotificationProvider"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  )
}
