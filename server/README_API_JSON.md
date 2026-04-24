# API locale JSON - Gestion locative

Ce serveur utilise des fichiers JSON comme base de donnees locale :

- `server/data/proprietaires.json`
- `server/data/locataires.json`
- `server/data/biens.json`

## Lancer le serveur

Depuis la racine du projet :

```bash
npm run server
```

Base URL par defaut : `http://localhost:3001`

## Ordre recommande pour les tests

1. Creer un proprietaire (`POST /api/proprietaires`)
2. Creer un locataire (`POST /api/locataires`) - optionnel
3. Creer un bien (`POST /api/biens`) en utilisant `proprietaireId` et (optionnel) `locataireId`

---

## 1) Proprietaires

### Creer un proprietaire

`POST /api/proprietaires`

Body JSON :

```json
{
  "nom": "Sophie Martin",
  "email": "sophie.martin@email.fr",
  "telephone": "0611223344",
  "adresse": "12 rue des Fleurs, Paris",
  "notes": "Proprietaire premium"
}
```

### Lister les proprietaires

`GET /api/proprietaires`

---

## 2) Locataires

### Creer un locataire

`POST /api/locataires`

Body JSON :

```json
{
  "nom": "Amine El Idrissi",
  "email": "amine.locataire@email.fr",
  "telephone": "0677889900",
  "profession": "Ingenieur",
  "revenuMensuel": 3200,
  "notes": "Dossier complet"
}
```

### Lister les locataires

`GET /api/locataires`

---

## 3) Biens

### Creer un bien

`POST /api/biens`

Body JSON :

```json
{
  "titre": "T2 Centre-ville",
  "type": "appartement",
  "adresse": "8 avenue Victor Hugo",
  "ville": "Lyon",
  "codePostal": "69002",
  "surface": 48,
  "loyerMensuel": 950,
  "chargesMensuelles": 90,
  "statut": "occupe",
  "proprietaireId": "owner_1711111111111_ab12cd34",
  "locataireId": "tenant_1711111111111_ef56gh78",
  "description": "Appartement lumineux proche metro"
}
```

Notes :

- `proprietaireId` est obligatoire et doit exister.
- `locataireId` est optionnel, mais s'il est fourni il doit exister.
- `loyerMensuel` doit etre un nombre positif.

### Lister les biens

`GET /api/biens`

---

## Workflow rapide dans Postman

1. Appeler `POST /api/proprietaires`
2. Copier l'`id` retourne (`data.id`)
3. Appeler `POST /api/locataires` (optionnel) puis copier l'`id`
4. Appeler `POST /api/biens` avec les IDs recuperes
5. Verifier via `GET /api/biens`

---

## Exemple cURL

```bash
curl -X POST http://localhost:3001/api/proprietaires \
  -H "Content-Type: application/json" \
  -d "{\"nom\":\"Jean Dupont\",\"email\":\"jean@email.fr\",\"telephone\":\"0600000000\"}"
```
