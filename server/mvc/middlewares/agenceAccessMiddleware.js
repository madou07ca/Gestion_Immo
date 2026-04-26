const permissionMatrix = {
  directeur_agence: {
    workspace: ['read'],
    proprietaires: ['create', 'update', 'delete'],
    locataires: ['create', 'update', 'delete'],
    gestionnaires: ['create', 'update', 'delete'],
    biens: ['create', 'update', 'delete'],
  },
  gestionnaire_agence: {
    workspace: ['read'],
    proprietaires: ['create', 'update'],
    locataires: ['create', 'update'],
    gestionnaires: ['create', 'update'],
    biens: ['create', 'update'],
  },
  lecture_seule: {
    workspace: ['read'],
    proprietaires: [],
    locataires: [],
    gestionnaires: [],
    biens: [],
  },
}

export function requireAgencePermission(resource, action) {
  return (req, res, next) => {
    const internalRole = req.auth?.internalRole
    if (!internalRole) {
      return res.status(403).json({
        ok: false,
        error: 'Aucun compte agence rattache a cette session.',
      })
    }
    const allowedActions = permissionMatrix[internalRole]?.[resource] || []
    if (!allowedActions.includes(action)) {
      return res.status(403).json({
        ok: false,
        error: `Permission insuffisante (${internalRole}) pour ${action} ${resource}.`,
      })
    }
    req.agenceSecurity = { internalRole }
    return next()
  }
}
