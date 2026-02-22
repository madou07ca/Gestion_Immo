import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { propertyTypes } from '../data/properties'

const travauxOptions = [
  'Aucun',
  'Travaux récents (moins de 5 ans)',
  'Travaux à prévoir',
  'Neuf / rénovation complète',
]

export default function EstimationForm() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    try {
      await fetch('/api/leads/estimation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      setSent(true)
    } catch {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl bg-night-700 border border-gold-500/30 p-8 text-center">
        <p className="text-gold-400 font-semibold text-lg">Demande d'estimation envoyée.</p>
        <p className="text-gray-400 mt-2">Nous étudions votre bien et vous recontacterons sous 48h avec une estimation personnalisée.</p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl bg-night-700 border border-night-600 p-6 md:p-8 space-y-4"
    >
      <h3 className="font-display text-xl font-semibold text-white mb-4">Informations personnelles</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Nom *</label>
          <input
            {...register('lastName', { required: 'Requis' })}
            className="w-full px-4 py-2.5 rounded-lg bg-night-800 border border-night-500 text-white"
            placeholder="Nom"
          />
          {errors.lastName && <p className="text-sm text-red-400">{errors.lastName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Prénom *</label>
          <input
            {...register('firstName', { required: 'Requis' })}
            className="w-full px-4 py-2.5 rounded-lg bg-night-800 border border-night-500 text-white"
            placeholder="Prénom"
          />
          {errors.firstName && <p className="text-sm text-red-400">{errors.firstName.message}</p>}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
          <input
            {...register('email', { required: 'Requis', pattern: { value: /^\S+@\S+$/i, message: 'Email invalide' } })}
            type="email"
            className="w-full px-4 py-2.5 rounded-lg bg-night-800 border border-night-500 text-white"
            placeholder="email@exemple.com"
          />
          {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Téléphone *</label>
          <input
            {...register('phone', { required: 'Requis' })}
            type="tel"
            className="w-full px-4 py-2.5 rounded-lg bg-night-800 border border-night-500 text-white"
            placeholder="+224 6XX XX XX XX"
          />
          {errors.phone && <p className="text-sm text-red-400">{errors.phone.message}</p>}
        </div>
      </div>

      <h3 className="font-display text-xl font-semibold text-white mt-8 mb-4">Votre bien</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Type de bien *</label>
          <select
            {...register('propertyType', { required: 'Requis' })}
            className="w-full px-4 py-2.5 rounded-lg bg-night-800 border border-night-500 text-white"
          >
            <option value="">Sélectionnez</option>
            {propertyTypes.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {errors.propertyType && <p className="text-sm text-red-400">{errors.propertyType.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Quartier / adresse *</label>
          <input
            {...register('address', { required: 'Requis' })}
            className="w-full px-4 py-2.5 rounded-lg bg-night-800 border border-night-500 text-white"
            placeholder="Quartier ou adresse"
          />
          {errors.address && <p className="text-sm text-red-400">{errors.address.message}</p>}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Surface habitable (m²)</label>
          <input
            {...register('surfaceHabitable')}
            type="number"
            min="0"
            className="w-full px-4 py-2.5 rounded-lg bg-night-800 border border-night-500 text-white"
            placeholder="Ex: 95"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Surface terrain (m²)</label>
          <input
            {...register('surfaceTerrain')}
            type="number"
            min="0"
            className="w-full px-4 py-2.5 rounded-lg bg-night-800 border border-night-500 text-white"
            placeholder="Ex: 300"
          />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Nombre de pièces</label>
          <input
            {...register('rooms')}
            type="number"
            min="0"
            className="w-full px-4 py-2.5 rounded-lg bg-night-800 border border-night-500 text-white"
            placeholder="Ex: 4"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Année de construction (si connue)</label>
          <input
            {...register('yearBuilt')}
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            className="w-full px-4 py-2.5 rounded-lg bg-night-800 border border-night-500 text-white"
            placeholder="Ex: 2015"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Travaux récents / à prévoir</label>
        <select
          {...register('travaux')}
          className="w-full px-4 py-2.5 rounded-lg bg-night-800 border border-night-500 text-white"
        >
          {travauxOptions.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Message / précisions</label>
        <textarea
          {...register('message')}
          rows={4}
          className="w-full px-4 py-2.5 rounded-lg bg-night-800 border border-night-500 text-white placeholder-gray-500"
          placeholder="Décrivez brièvement votre bien ou vos attentes..."
        />
      </div>
      <button
        type="submit"
        className="w-full py-3 rounded-lg bg-gold-500 text-night-900 font-semibold hover:bg-gold-400 mt-4"
      >
        Demander mon estimation
      </button>
    </form>
  )
}
