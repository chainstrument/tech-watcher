# Tech Watcher

Agrégateur de veille technologique : collecte automatique depuis RSS, Hacker News et GitHub Releases, enrichissement par IA (résumés, embeddings, scoring de pertinence) et restitution via dashboard web et digest email.

## Stack

- **Framework** : Next.js 15 (TypeScript, App Router)
- **Base de données** : PostgreSQL + pgvector (embeddings)
- **IA** : API Claude (Anthropic) — résumés, scoring, classification
- **Style** : Tailwind CSS

## Structure du projet

```
src/
  app/              # Pages et API routes (Next.js App Router)
  components/       # Composants React
  lib/
    connectors/     # Connecteurs de sources (RSS, HN, GitHub)
    pipeline/       # Scheduler, déduplication, stockage
    ai/             # Résumés, embeddings, scoring
    db/             # Accès base de données
  types/            # Types TypeScript partagés
```

## Lancement en local

### Prérequis

- Node.js 20+
- PostgreSQL 15+
- Un compte [Anthropic](https://console.anthropic.com) pour la clé API

### Installation

```bash
# 1. Cloner le repo
git clone git@github.com:chainstrument/tech-watcher.git
cd tech-watcher

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# 4. Initialiser la base de données
npm run db:migrate

# 5. Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

### Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | Vérification du code |
| `npm run db:migrate` | Appliquer les migrations |
| `npm run pipeline` | Lancer le pipeline manuellement |

## Variables d'environnement

Voir [.env.example](.env.example) pour la liste complète des variables à configurer.
