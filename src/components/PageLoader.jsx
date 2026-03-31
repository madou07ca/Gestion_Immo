export default function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-10 w-10 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin"
          aria-hidden
        />
        <p className="text-sm text-gray-400">Chargement…</p>
      </div>
    </div>
  )
}
