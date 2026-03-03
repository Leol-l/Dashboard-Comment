# Dashboard-Comment

Frontend Next.js du dashboard de satisfaction GLPI.

Ce projet :
- affiche les KPI de satisfaction,
- visualise la répartition des sections (`ERP`, `Admin`, `Support`),
- présente les commentaires mensuels et les éléments d'analyse,
- consomme l'API backend `API-GLPI`.

## Stack

- Next.js (App Router)
- React
- Axios
- Recharts
- Lucide React
- Tailwind CSS

## Ports et URLs

- Frontend Next : `http://localhost:3001`
- API backend attendue : `http://localhost:3000`
- Base path frontend : `/Dashboard`
	- URL finale locale : `http://localhost:3001/Dashboard`

## Structure (simplifiée)

```txt
dashboard-comment/
	src/
		app/
			page.js
			section/page.js
			api/
				satisfaction/route.js
				section/monthly-comments/route.js
		components/
			Satisfaction.js
			SectionDashboardTemplate.js
			AnalysisColumn.js
			SectionDistribution.js
			StatCard.js
			Motivation.js
			Navbar.js
	next.config.mjs
	package.json
```

## Installation

```bash
npm install
```

## Scripts npm

- `npm run dev` : démarre en dev sur le port `3001`.
- `npm run build` : build de production.
- `npm run start` : lance l'app buildée sur `3001`.
- `npm run lint` : lint Next.js.

## Configuration Next

Le fichier `next.config.mjs` configure :
- `basePath: '/Dashboard'`
- `NEXT_PUBLIC_BASE_PATH: '/Dashboard'`
- une rewrite pour proxy externe :
	- source : `/api/external/:path*`
	- destination : `http://localhost:3000/api/:path*`

## Routes API internes (Next)

Ces routes servent de proxy/BFF entre le frontend et `API-GLPI`.

- `GET /Dashboard/api/satisfaction`
	- cible backend : `/api/dashboard/satisfaction-data`
	- retourne : `{ average, total }`

- `GET /Dashboard/api/section/monthly-comments?section=Support|Admin|ERP`
	- cible backend : `/api/dashboard/section-monthly-comments?section=...`
	- retourne :
		- `data`
		- `stats.today/month/global`
		- `monthlyComments`

## Endpoints backend consommés

Le frontend utilise les endpoints backend suivants :
- `/api/dashboard/satisfaction-data`
- `/api/dashboard/sections-distribution`
- `/api/dashboard/section-monthly-comments`

## Démarrage local complet

### 1) Démarrer l'API backend

Dans `API-GLPI` :

```bash
npm install
npm run dev
```

### 2) Démarrer le frontend

Dans `Dashboard-Comment/dashboard-comment` :

```bash
npm install
npm run dev
```

Ouvrir ensuite : `http://localhost:3001/Dashboard`

## Flux de données

1. Le composant React appelle une route API Next (`/api/...`).
2. La route Next appelle le backend Express (`localhost:3000`).
3. Le backend renvoie un payload agrégé.
4. Le frontend affiche les cartes, colonnes d'analyse et graphiques.

## Erreurs fréquentes

- `Unexpected token '<', "<!DOCTYPE ..." is not valid JSON`
	- signifie que l'URL appelée renvoie du HTML (souvent une 404) au lieu d'un JSON.
	- vérifier que les fichiers API sont bien au format App Router : `.../route.js`.

- Données vides dans la section
	- vérifier que l'API backend expose bien `/api/dashboard/section-monthly-comments`.
	- vérifier la valeur du paramètre `section`.

- Requêtes API qui échouent
	- vérifier que `API-GLPI` tourne sur le port `3000`.

## Bonnes pratiques de dev

- Garder la logique métier côté backend (`API-GLPI`).
- Garder le frontend centré sur l'affichage et l'interaction.
- Utiliser les routes API Next comme couche d'accès stable entre UI et backend.
