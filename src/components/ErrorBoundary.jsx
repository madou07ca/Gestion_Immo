import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="rounded-xl bg-night-700 border border-night-600 p-6 text-center text-gray-400">
          {this.props.message ?? 'Contenu temporairement indisponible.'}
        </div>
      )
    }
    return this.props.children
  }
}
