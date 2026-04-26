# Architecture MVC - Backend `server/`

Ce document decrit l'organisation backend adoptee pour le projet.

## Objectif

- separer clairement les responsabilites
- rendre le code evolutif et testable
- eviter de surcharger `server/index.js`

## Structure

```text
server/
  index.js                     # bootstrap Express + montage des routes
  mvc/
    routes/                    # definition des endpoints HTTP
    controllers/               # adaptation HTTP <-> logique metier
    services/                  # logique metier / regles fonctionnelles
    repositories/              # acces aux donnees (JSON pour l'instant)
    utils/                     # utilitaires partages
```

## Responsabilites par couche

- `routes`
  - declare les endpoints (`GET`, `POST`, `PUT`, `DELETE`)
  - delegue vers un controller
  - ne contient pas de logique metier

- `controllers`
  - lit `req` (params, query, body)
  - appelle un service
  - convertit le resultat en reponse HTTP (`status`, `json`)
  - ne doit pas acceder directement aux fichiers JSON

- `services`
  - contient les regles metier (validations, orchestration, calculs)
  - combine plusieurs repositories si necessaire
  - retourne un format standard:
    - `{ data: ... }` en succes
    - `{ error: { status, message } }` en erreur

- `repositories`
  - encapsule lecture/ecriture de collections JSON
  - expose des fonctions CRUD simples
  - pas de logique HTTP

- `utils`
  - fonctions transverses (`ensureString`, `isEmail`, `createId`, etc.)
  - acces generique au datastore (`readCollectionByKey`, `writeCollectionByKey`)

## Flux standard d'une requete

1. `route` recoit la requete
2. `controller` appelle un `service`
3. `service` utilise un ou plusieurs `repositories`
4. `controller` renvoie la reponse HTTP

## Conventions de nommage

- Fichiers route: `xxxRoutes.js`
- Fichiers controller: `xxxController.js`
- Fichiers service: `xxxService.js`
- Fichiers repository: `xxxRepository.js`
- Fonctions controller: `actionXxxController`
- Fonctions service: `actionXxxService` ou `actionXxx`

## Exemple de pattern de retour (service)

```js
// succes
return { data: createdItem }

// erreur
return { error: { status: 400, message: 'Champ obligatoire manquant.' } }
```

## Comment ajouter une nouvelle fonctionnalite

1. creer/mettre a jour le(s) repository(s)
2. implementer la logique dans un service
3. creer le controller HTTP
4. declarer la route
5. monter la route dans `server/index.js`
6. verifier lint + syntaxe

## Etat actuel

- Les domaines principaux sont deja migres en MVC:
  - auth + administration acces
  - proprietaires / locataires / biens
  - prospects / contrats
  - locataire me (demandes, paiements)
  - quittances / gestionnaire quittances
  - proprietaire me
  - public biens
- Les routes `leads` restent dans `index.js` (compatibilite historique) et peuvent etre migrees ensuite.

