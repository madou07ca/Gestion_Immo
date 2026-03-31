import { Component } from 'react'
import { Link } from 'react-router-dom'

export default class AppErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-night-900 text-center">
          <h1 className="font-display text-2xl font-bold text-white mb-2">Une erreur s’est produite</h1>
          <p className="text-gray-400 max-w-md mb-6">
            La page n’a pas pu s’afficher correctement. Vous pouvez recharger ou retourner à l’accueil.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-lg bg-gold-500 text-night-900 font-semibold hover:bg-gold-400"
            >
              Recharger la page
            </button>
            <Link
              to="/"
              className="px-5 py-2.5 rounded-lg border border-night-500 text-gray-300 hover:border-gold-500/50"
            >
              Accueil
            </Link>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
