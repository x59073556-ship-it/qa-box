export const metadata = {
  title: '觀眾專屬提問箱',
  description: '想問什麼都可以大膽提出來！',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-slate-50 text-slate-800 min-h-screen flex items-center justify-center p-4">
        {children}
      </body>
    </html>
  )
}
