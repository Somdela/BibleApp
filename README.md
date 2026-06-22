# Bible App

Application de lecture biblique personnelle (React Native / Expo), pour usage privé sur
un seul iPhone via Expo Go. Pas d'authentification, pas de publication sur l'App Store.

## Fonctionnalites

- **Lecture multi-versions** : jusqu'a 5 versions affichees cote a cote pour comparaison.
  Actuellement disponibles :
  - **Bible J.N. Darby** (JND) via [API.Bible](https://scripture.api.bible)
  - **Louis Segond 1910** via [getbible.net](https://getbible.net) (domaine public, API
    gratuite sans cle — voir `services/getbibleApi.ts`)
- **Navigation livre/chapitre** instantanee et hors-ligne, basee sur le canon protestant
  statique (`constants/canon.ts`), independante des fournisseurs de contenu ci-dessus.
- **Annotations** : surlignage (5 couleurs), notes personnelles, signets — par verset,
  stockes en local (SQLite), partages entre toutes les versions d'un meme verset.
- **Recherche** plein texte par mot/expression (API.Bible uniquement — getbible.net n'a
  pas d'endpoint de recherche).
- **Mode hors-ligne** : chaque chapitre consulte est mis en cache (SQLite) et reste
  lisible sans reseau.
- **Explications IA par verset** : via une Edge Function Supabase qui appelle l'API
  Claude. Retombe automatiquement sur un texte de demonstration si la fonction n'est pas
  joignable ou si le compte Anthropic n'a pas de credits (voir Limites connues).

## Stack technique

- **React Native + Expo SDK 54** (`expo-router` pour la navigation par fichiers)
- **expo-sqlite** — cache de chapitres + annotations, 100% local
- **Supabase** — uniquement comme backend pour l'Edge Function IA (pas d'authentification,
  pas de base de donnees cote client)
- **API.Bible** + **getbible.net** — deux fournisseurs de contenu biblique
- **EAS Update** — publication du bundle JS sur l'infrastructure Expo (voir plus bas)

## Installation (developpement)

```bash
npm install
npx expo start --tunnel
```

Scanner le QR code (ou "Enter URL manually") avec l'app **Expo Go** sur iPhone.

### Variables d'environnement

Copier `.env.example` vers `.env` et renseigner :

```env
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_BIBLE_API_KEY=...
```

`ANTHROPIC_API_KEY` n'est **pas** une variable client : c'est un secret Supabase, a
definir avec `supabase secrets set ANTHROPIC_API_KEY=...` (jamais dans `.env`, jamais
expose au bundle JS — voir `supabase/functions/explain-verse/index.ts`).

## Acces permanent (sans serveur de developpement)

L'app est publiee sur EAS Update — accessible a tout moment sans avoir besoin de lancer
`expo start` :

```
exp://u.expo.dev/1500358d-551e-4bf5-b80f-815743634fdb?runtime-version=54.0.0&channel-name=production
```

Le projet est **prive** (necessite d'etre connecte a Expo Go avec un compte membre du
projet). Pour mettre a jour l'app apres une modification du code :

```bash
npx eas-cli update --branch production --message "..."
```

Un raccourci iOS (app **Raccourcis**, action "Ouvrir l'URL" + icone personnalisee) permet
d'ouvrir ce lien depuis l'ecran d'accueil sans repasser par Expo Go.

## Structure du projet

```
BibleApp/
├── app/                    # Ecrans (expo-router)
│   ├── (tabs)/
│   │   ├── index.tsx       # Accueil (reprendre la lecture)
│   │   ├── lecture.tsx     # Lecture + comparaison multi-versions
│   │   └── search.tsx      # Recherche plein texte
│   └── _layout.tsx
├── components/             # Composants UI reutilisables
├── constants/              # Canon biblique, theme, config API
├── hooks/                  # Hooks de donnees (versions, chapitres, annotations, ...)
├── services/               # Acces API.Bible / getbible.net, SQLite, Supabase
├── supabase/functions/     # Edge Function (explications IA via Claude)
└── assets/                 # Icone et splash
```

## Limites connues

| Sujet | Etat |
|---|---|
| Segond 21 / Le Semeur / Parole Vivante | Indisponibles : sous droits, aucune API gratuite ; necessite une demande d'acces approuvee sur api.bible |
| Recherche plein texte | Fonctionne uniquement sur les versions API.Bible (pas getbible.net) |
| Explications IA | Necessite des credits sur le compte Anthropic lie au secret Supabase (console.anthropic.com -> Plans & Billing) |
| `services/usxParser.ts` | Parseur du format JSON d'API.Bible non valide contre toutes les variantes possibles ; retombe automatiquement sur du texte brut si le decoupage par verset echoue |

## Licence

Projet prive — usage personnel.
