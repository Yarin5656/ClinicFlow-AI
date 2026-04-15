import type { Metadata } from "next"
import { Heebo, Frank_Ruhl_Libre } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/layout/Providers"

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

const frankRuhlLibre = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  variable: "--font-frank",
  weight: ["400", "500", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "MoveEasy Israel — מעבר דירה בקלות",
  description: "נהל את כל הביורוקרטיה של מעבר הדירה שלך במקום אחד",
  other: { "content-language": "he" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} ${frankRuhlLibre.variable}`}>
      <body className="bg-surface text-[var(--color-text)] font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
