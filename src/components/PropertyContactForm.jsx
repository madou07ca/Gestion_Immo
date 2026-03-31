import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { X } from 'lucide-react'
import { getLeadsSubmitUrl, isOdooLeads } from '../config'

export default function PropertyContactForm({ property, onClose }) {
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { subject: `Demande d'info: ${property?.title}`, propertyId: property?.id },
  })

  const onSubmit = async (data) => {
    setSubmitError(null)
    setSubmitting(true)
    try {
      const payload = { ...data, propertyId: property?.id, propertyTitle: property?.title }
      const url = getLeadsSubmitUrl('contact-bien')
      const body = isOdooLeads ? { type: 'contact-bien', ...payload } : payload
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night-900/90" onClick={onClose}>
      <div
        className="bg-night-800 border border-night-600 rounded-xl max-w-md w-full p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-display text-xl font-semibold text-white">
            {sent ? 'Message envoyé' : 'Demande d\'informations'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>
        {sent ? (
          <p className="text-gray-400">
            Nous vous recontacterons rapidement concernant ce bien.
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register('propertyId')} />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nom *</label>
              <input
                {...register('name', { required: 'Requis' })}
                className="w-full px-4 py-2 rounded-lg bg-night-700 border border-night-500 text-white"
                placeholder="Votre nom"
              />
              {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Téléphone *</label>
              <input
                {...register('phone', { required: 'Requis' })}
                type="tel"
                className="w-full px-4 py-2 rounded-lg bg-night-700 border border-night-500 text-white"
                placeholder="+224 6XX XX XX XX"
              />
              {errors.phone && <p className="text-sm text-red-400">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
              <input
                {...register('email', { required: 'Requis', pattern: { value: /^\S+@\S+$/i, message: 'Email invalide' } })}
                type="email"
                className="w-full px-4 py-2 rounded-lg bg-night-700 border border-night-500 text-white"
                placeholder="email@exemple.com"
              />
              {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Message</label>
              <textarea
                {...register('message')}
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-night-700 border border-night-500 text-white placeholder-gray-500"
                placeholder="Souhaitez-vous une visite ? Des précisions sur le bien ?"
              />
            </div>
            {submitError && (
              <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2" role="alert">
                {submitError}
              </p>
            )}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-lg border border-night-500 text-gray-400"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 rounded-lg bg-gold-500 text-night-900 font-semibold hover:bg-gold-400 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Envoi…' : 'Envoyer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
