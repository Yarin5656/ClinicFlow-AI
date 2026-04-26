"use client"

import { useEffect } from "react"

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html>
      <body className="flex items-center justify-center min-h-screen bg-white" dir="rtl">
        <div className="flex flex-col items-center gap-4 p-8 text-center">
          <p className="text-4xl">⚠️</p>
          <h2 className="text-xl font-bold">שגיאה בלתי צפויה</h2>
          <p className="text-sm text-gray-500 max-w-xs">אירעה שגיאה. אנא נסה לרענן את הדף.</p>
          <button
            onClick={reset}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600"
          >
            נסה שוב
          </button>
        </div>
      </body>
    </html>
  )
}
