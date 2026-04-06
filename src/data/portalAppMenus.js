import {
  LayoutGrid,
  Wallet,
  Wrench,
  FileText,
  MessageSquare,
  Building2,
  Banknote,
  BarChart3,
  UserPlus,
  Users,
  Landmark,
  Target,
  ClipboardList,
  Receipt,
  AlertCircle,
  ScrollText,
} from 'lucide-react'

export const portalAppMenus = {
  locataire: [
    { path: '', label: 'Tableau de bord', icon: LayoutGrid },
    { path: 'loyers', label: 'Loyers & quittances', icon: Wallet },
    { path: 'demandes', label: 'Demandes & incidents', icon: Wrench },
    { path: 'documents', label: 'Documents', icon: FileText },
    { path: 'messages', label: 'Messages', icon: MessageSquare },
  ],
  proprietaire: [
    { path: '', label: 'Tableau de bord', icon: LayoutGrid },
    { path: 'biens', label: 'Mes biens', icon: Building2 },
    { path: 'encaissements', label: 'Encaissements', icon: Banknote },
    { path: 'reporting', label: 'Reporting', icon: BarChart3 },
    { path: 'candidatures', label: 'Candidatures', icon: UserPlus },
  ],
  agence: [
    { path: '', label: 'Tableau de bord', icon: LayoutGrid },
    { path: 'mandats', label: 'Mandats', icon: Landmark },
    { path: 'leads', label: 'Leads & pipeline', icon: Target },
    { path: 'visites', label: 'Visites', icon: ClipboardList },
    { path: 'equipe', label: 'Équipe', icon: Users },
  ],
  gestionnaire: [
    { path: '', label: 'Tableau de bord', icon: LayoutGrid },
    { path: 'tickets', label: 'Tickets & maintenance', icon: AlertCircle },
    { path: 'quittances', label: 'Quittances & relances', icon: Receipt },
    { path: 'reporting', label: 'Reporting multi', icon: BarChart3 },
    { path: 'audit', label: 'Journal & audit', icon: ScrollText },
  ],
}
