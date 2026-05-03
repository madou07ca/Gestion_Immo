import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export default function HomeFaqAccordion({ items, title = 'Questions fréquentes', subtitle }) {
  const [open, setOpen] = useState(null)

  return (
    <div className="rounded-xl border border-night-600 bg-night-800/70 p-6 md:p-8 ring-1 ring-white/5">
      <h2 className="font-display text-2xl md:text-3xl font-bold text-white text-center mb-2">{title}</h2>
      {subtitle ? <p className="text-center text-gray-200 text-sm mb-8 max-w-2xl mx-auto leading-relaxed">{subtitle}</p> : <div className="mb-8" />}
      <ul className="space-y-2 max-w-3xl mx-auto">
        {items.map((item, i) => {
          const isOpen = open === i
          return (
            <li key={i} className="rounded-lg border border-night-600 bg-night-900/50 overflow-hidden">
              <button
                type="button"
                id={`home-faq-btn-${i}`}
                aria-expanded={isOpen}
                aria-controls={`home-faq-panel-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-3 text-left px-4 py-3.5 text-white font-medium hover:bg-night-800/60 transition-colors"
              >
                <span className="text-sm md:text-base pr-2">{item.q}</span>
                <ChevronDown
                  size={20}
                  className={`shrink-0 text-gold-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  aria-hidden
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    id={`home-faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`home-faq-btn-${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-4 pt-0 text-sm text-gray-200 leading-relaxed border-t border-night-700/80">
                      {item.a}
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
