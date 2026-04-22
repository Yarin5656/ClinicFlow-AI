import { Heebo, Frank_Ruhl_Libre } from "next/font/google"
import "../globals.css"

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

export default function PublicFormLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} ${frankRuhlLibre.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
