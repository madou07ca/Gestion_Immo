import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { getLeadsSubmitUrl, isOdooLeads } from '../config'
import { propertyTypes } from '../data/properties'

export default function GestionLocativeForm() {
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setSubmitError(null)
    setSubmitting(true)
    try {
      const url = getLeadsSubmitUrl('gestion-locative')
      const body = isOdooLeads ? { type: 'gestion-locative', ...data } : data
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setSent(true)
        return
      }
      let msg = 'Envoi impossible. Réessayez plus tard ou contactez-nous par téléphone.'
      try {
        const j = await res.json()
        if (j?.error) msg = j.error
      } catch {
        /* ignore */
      }
      setSubmitError(msg)
    } catch {
      setSubmitError('Connexion impossible. Vérifiez votre réseau et réessayez.')
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl bg-night-700 border border-gold-500/30 p-8 text-center">
        <p className="text-gold-400 font-semibold">Demande envoyée.</p>
        <p className="text-gray-400 mt-2">Nous vous recontacterons sous 24h pour étudier votre projet de gestion locative.</p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl bg-night-700 border border-night-600 p-6 md:p-8 space-y-4"
    >
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
          <label className="block text-sm font-medium text-gray-300 mb-1">Quartier / localisation</label>
          <input
            {...register('location')}
            className="w-full px-4 py-2.5 rounded-lg bg-night-800 border border-night-500 text-white"
            placeholder="Quartier ou adresse"
          />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Surface (m²)</label>
          <input
            {...register('surface')}
            type="number"
            min="0"
            className="w-full px-4 py-2.5 rounded-lg bg-night-800 border border-night-500 text-white"
            placeholder="Ex: 95"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Loyer souhaité (GNF/mois)</label>
          <input
            {...register('rent')}
            type="number"
            min="0"
            className="w-full px-4 py-2.5 rounded-lg bg-night-800 border border-night-500 text-white"
            placeholder="Ex: 850000"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Message</label>
        <textarea
          {...register('message')}
          rows={4}
          className="w-full px-4 py-2.5 rounded-lg bg-night-800 border border-night-500 text-white placeholder-gray-500"
          placeholder="Précisez votre situation (bien vide, actuellement loué, etc.)"
        />
      </div>
      {submitError && (
        <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2" role="alert">
          {submitError}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 rounded-lg bg-gold-500 text-night-900 font-semibold hover:bg-gold-400 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? 'Envoi en cours…' : 'Envoyer ma demande'}
      </button>
    </form>
  )
}
