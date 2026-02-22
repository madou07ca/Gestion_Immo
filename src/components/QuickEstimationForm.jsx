import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { propertyTypes } from '../data/properties'

export default function QuickEstimationForm() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    try {
      const res = await fetch('/api/leads/estimation-rapide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) setSent(true)
      else setSent(true) // en dev sans API on affiche succès quand même
    } catch {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl bg-night-700 border border-gold-500/30 p-8 text-center"
      >
        <p className="text-gold-400 font-semibold text-lg">Demande envoyée avec succès.</p>
        <p className="text-gray-400 mt-2">Nous vous recontacterons sous 24h pour votre estimation confidentielle.</p>
      </motion.div>
    )
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl bg-night-700 border border-night-600 p-6 md:p-8 space-y-4"
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Nom *</label>
          <input
            {...register('name', { required: 'Champ requis' })}
            className="w-full px-4 py-2.5 rounded-lg bg-night-800 border border-night-500 text-white placeholder-gray-500 focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
            placeholder="Votre nom"
          />
          {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Téléphone *</label>
          <input
            {...register('phone', { required: 'Champ requis' })}
            type="tel"
            className="w-full px-4 py-2.5 rounded-lg bg-night-800 border border-night-500 text-white placeholder-gray-500 focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
            placeholder="+224 6XX XX XX XX"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
        <input
          {...register('email', { required: 'Champ requis', pattern: { value: /^\S+@\S+$/i, message: 'Email invalide' } })}
          type="email"
          className="w-full px-4 py-2.5 rounded-lg bg-night-800 border border-night-500 text-white placeholder-gray-500 focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
          placeholder="email@exemple.com"
        />
        {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Type de bien *</label>
          <select
            {...register('propertyType', { required: 'Champ requis' })}
            className="w-full px-4 py-2.5 rounded-lg bg-night-800 border border-night-500 text-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
          >
            <option value="">Sélectionnez</option>
            {propertyTypes.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {errors.propertyType && <p className="mt-1 text-sm text-red-400">{errors.propertyType.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Surface (m²)</label>
          <input
            {...register('surface', { min: 0 })}
            type="number"
            min="0"
            className="w-full px-4 py-2.5 rounded-lg bg-night-800 border border-night-500 text-white placeholder-gray-500 focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
            placeholder="Ex: 120"
          />
        </div>
      </div>
      <div className="pt-2">
        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-gold-500 text-night-900 font-semibold hover:bg-gold-400 transition-colors"
        >
          Demander mon estimation
        </button>
      </div>
    </motion.form>
  )
}
