// "use client"

// import { useEffect, useState } from "react"

// export function InitialLoading() {
//   const [show, setShow] = useState(true)

//   useEffect(() => {
//     const t = setTimeout(() => setShow(false), 2000)
//     return () => clearTimeout(t)
//   }, [])

//   if (!show) return null

//   return (
//     <div
//       role="status"
//       aria-live="polite"
//       className="fixed inset-0 z-50 grid place-items-center bg-background/90 backdrop-blur-sm"
//     >
//       <div className="flex items-center gap-2 rounded-full border border-input bg-card px-4 py-2 shadow-sm">
//         <span className="sr-only">Loading…</span>
//         <span className="size-2 animate-bounce rounded-full bg-foreground [animation-delay:-0.2s]" />
//         <span className="size-2 animate-bounce rounded-full bg-foreground" />
//         <span className="size-2 animate-bounce rounded-full bg-foreground [animation-delay:0.2s]" />
//       </div>
//     </div>
//   )
// }
