# Dashboard-Comment

Frontend Next.js (App Router) pour la visualisation des analyses de satisfaction GLPI produites par `API-GLPI`.

## Sommaire

- [Objectif](#objectif)
- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Arborescence](#arborescence)
- [Configuration Next](#configuration-next)
- [Ports, URLs et basePath](#ports-urls-et-basepath)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Démarrage](#démarrage)
- [Pages et navigation](#pages-et-navigation)
- [Routes API internes (BFF/proxy)](#routes-api-internes-bffproxy)
- [Endpoints backend consommés](#endpoints-backend-consommés)
- [Flux de données](#flux-de-données)
- [Structure attendue des payloads](#structure-attendue-des-payloads)
- [Comportements UI importants](#comportements-ui-importants)
- [Dépannage](#dépannage)
- [Scripts npm](#scripts-npm)

## Objectif

Ce projet fournit une interface orientée exploitation pour :

- suivre les KPI de satisfaction (jour/mois/global),
- visualiser la distribution des sections (`Support`, `ERP`, `Admin`),
- explorer les thèmes récurrents et irritants majeurs,
- consulter la tendance journalière des commentaires sur 30 jours,
- filtrer l’analyse par section.

## Fonctionnalités

- Dashboard global (`/Dashboard`) avec :
	- cartes de stats,
	- jauge de satisfaction,
	- colonnes analytiques (thèmes/irritants),
	- distribution par section.
- Dashboard section (`/Dashboard/section?section=...`) avec :
	- mêmes KPI appliqués à la section,
	- graphe `monthlyComments` sur 30 jours,
	- extraction des commentaires motivants.
- Actualisation périodique des données (toutes les 60 secondes sur la page section).
- Barre de navigation avec onglets de section et compteur de rafraîchissement visuel.

## Stack technique

- Next.js 16 (App Router)
- React 19
- Axios
- Recharts
- Lucide React
- Tailwind CSS 4

## Arborescence

```txt
dashboard-comment/
	src/
		app/
			layout.js
			page.js
			section/page.js
			api/
				satisfaction/route.js
				section/monthly-comments/route.js
		components/
			AnalysisColumn.js
			Motivation.js
			Navbar.js
			Satisfaction.js
			SectionDashboardTemplate.js
			SectionDistribution.js
			StatCard.js
	next.config.mjs
	package.json
```

## Configuration Next

Le fichier `next.config.mjs` contient :

- `basePath: '/Dashboard'`
- variable d’environnement publique injectée : `NEXT_PUBLIC_BASE_PATH='/Dashboard'`
- variable d’environnement publique injectée : `NEXT_PUBLIC_REFRESH_INTERVAL_MS` (dérivée de `SCHEDULE_INTERVAL`)
- variable d’environnement backend : `API_BASE_URL` (défaut `http://localhost:3000`)
- rewrite proxy :
	- source : `/api/external/:path*`
	- destination : `${API_BASE_URL}/api/:path*`

Cette rewrite permet aux composants de taper des URLs locales Next tout en ciblant le backend Express.

## Ports, URLs et basePath

- Frontend local : `http://localhost:3001`
- URL de l’application : `http://localhost:3001/Dashboard`
- Backend attendu : valeur de `API_BASE_URL` (par défaut `http://localhost:3000`)

Important : avec `basePath`, les routes visibles côté navigateur incluent toujours `/Dashboard`.

## Prérequis

- Node.js 18+ (LTS recommandé)
- API backend `API-GLPI` démarrée sur le port `3000`

## Installation

Depuis le dossier `Dashboard-Comment/dashboard-comment` :

```bash
npm install
```

## Démarrage

### Développement

```bash
npm run dev
```

Optionnel (si ton backend n'est pas sur `localhost:3000`) :

```powershell
$env:API_BASE_URL='http://localhost:3000'
$env:SCHEDULE_INTERVAL='30'
npm run dev
```

`SCHEDULE_INTERVAL` pilote aussi l’actualisation automatique du dashboard (même cadence que le scheduler API).

### Build + run production

```bash
npm run build
npm run start
```

## Pages et navigation

- `/Dashboard`
	- page globale (fichier `src/app/page.js`)
- `/Dashboard/section?section=Support|ERP|Admin`
	- page section (fichiers `src/app/section/page.js` + `src/components/SectionDashboardTemplate.js`)

Règle de normalisation : si `section` est invalide, la page bascule sur `Support`.

## Routes API internes (BFF/proxy)

### `GET /Dashboard/api/satisfaction`

- Source : `src/app/api/satisfaction/route.js`
- Appelle : `${API_BASE_URL}/api/dashboard/satisfaction-data`
- Retour principal :

```json
{
	"average": 3.8,
	"total": 120
}
```

### `GET /Dashboard/api/section/monthly-comments?section=Support|ERP|Admin`

- Source : `src/app/api/section/monthly-comments/route.js`
- Appelle : `${API_BASE_URL}/api/dashboard/section-monthly-comments?section=...`
- Retourne le payload de section ; en fallback retourne un payload vide structuré.
- En cas de `404` backend, ajoute une clé `warning` explicite pour faciliter le diagnostic.

## Endpoints backend consommés

Selon les écrans et composants, le frontend consomme :

- `/api/dashboard/satisfaction-data`
- `/api/dashboard/sections-distribution`
- `/api/dashboard/section-monthly-comments`

Deux modes d’accès coexistent :

- via rewrite Next (`/api/external/...`) depuis les composants client,
- via routes API Next internes (`/api/section/monthly-comments`, `/api/satisfaction`).

## Flux de données

1. L’UI appelle soit une route API Next, soit une route rewrite locale.
2. Next relaie vers `API-GLPI` via `API_BASE_URL`.
3. Le backend renvoie des données déjà agrégées (stats, section, séries journalières).
4. Les composants React calculent l’affichage final :
	 - top thèmes,
	 - top irritants,
	 - commentaires motivants,
	 - cartes de stats et graphiques.

## Structure attendue des payloads

### Payload global (`/api/dashboard/satisfaction-data`)

```json
{
	"total": 120,
	"data": [
		{
			"id": 1,
			"tickets_id": 1001,
			"satisfaction": 4,
			"date_answered": "2026-03-04",
			"comment": "...",
			"analysis_result": "{...}"
		}
	],
	"stats": {
		"today": { "count": 1, "avg": 4, "deltaPct": 0 },
		"month": { "count": 20, "avg": 3.9, "deltaPct": 0.1 },
		"global": { "count": 120, "avg": 4.1, "deltaPct": 0.02 }
	}
}
```

### Payload section (`/api/dashboard/section-monthly-comments`)

```json
{
	"section": "Support",
	"total": 60,
	"data": [],
	"stats": {
		"today": { "count": 0, "avg": 0, "deltaPct": 0 },
		"month": { "count": 0, "avg": 0, "deltaPct": 0 },
		"global": { "count": 0, "avg": 0, "deltaPct": 0 }
	},
	"monthlyComments": [
		{ "date": "2026-02-04", "count": 0 }
	]
}
```

## Comportements UI importants

- Les colonnes analytiques lisent `analysis_result` (JSON string ou objet) pour extraire :
	- `themes_recurrents`
	- `irritants_majeurs`
	- `actions_prioritaires`
- Les commentaires motivants sont filtrés avec `satisfaction >= 4`.
- Les statistiques affichées sont sécurisées (`sanitizeStat`) pour éviter les valeurs `NaN`.

## Dépannage

### Erreur JSON `Unexpected token '<'`

Cause probable : URL retournant du HTML (404) au lieu de JSON.

Vérifier :

- que l’API backend tourne bien,
- que les routes App Router existent en `.../route.js`,
- que l’URL inclut correctement `/Dashboard` en front.

### Données sections vides

- Vérifier l’endpoint backend `/api/dashboard/section-monthly-comments`.
- Vérifier que `section` vaut `Support`, `ERP` ou `Admin`.

### Erreurs de connexion API

- Vérifier que `API_BASE_URL` pointe vers `API-GLPI`.
- Vérifier les rewrites dans `next.config.mjs`.

### Navigation incorrecte sans basePath

- Vérifier que les URLs frontend utilisent bien `/Dashboard`.
- Vérifier que `NEXT_PUBLIC_BASE_PATH` est défini via `next.config.mjs`.

## Scripts npm

- `npm run dev` : démarre Next.js sur `3001`
- `npm run build` : build production
- `npm run start` : démarre l’app buildée sur `3001`
- `npm run lint` : lint projet

## Démarrage local complet (backend + frontend)

### 1) Démarrer API-GLPI

Dans `API-GLPI` :

```bash
npm install
npm run dev
```

### 2) Démarrer Dashboard-Comment

Dans `Dashboard-Comment/dashboard-comment` :

```bash
npm install
npm run dev
```

Puis ouvrir : `http://localhost:3001/Dashboard`
