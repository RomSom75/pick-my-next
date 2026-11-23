# Pick My Next

Addon Stremio/Nuvio qui choisit une série à regarder à partir de listes MDBList et de la progression MDBList.

## Fonctionnement

- lit plusieurs listes MDBList et supprime les doublons ;
- lit les épisodes déjà vus via MDBList ;
- respecte l’ordre des saisons ;
- ignore les saisons pas encore entièrement diffusées ;
- exclut les séries entièrement regardées ;
- expose un catalogue compatible Stremio/Nuvio.

MDBList fournit les listes et le suivi. TMDb sert uniquement à vérifier les saisons et les dates de diffusion.

## Installation locale

Pré-requis : Node.js 18 ou plus récent.

```bash
git clone <url-du-depot>
cd pick-my-next
cp .env.example .env
node --test
PORT=7001 node src/server.js
```

Ouvrir ensuite `http://localhost:7001/configure`.

Le configurateur permet de vérifier les clés, de créer plusieurs catalogues et d’ajouter plusieurs sources MDBList dans chaque catalogue.

## Clés nécessaires

La clé MDBList est disponible dans [les préférences MDBList](https://mdblist.com/preferences/). Pour TMDb, Pick My Next accepte une clé API v3 ou un Read Access Token v4.

Les clés ne sont jamais enregistrées dans un fichier. Le configurateur génère une URL personnelle contenant une configuration chiffrée. La variable `PICK_SECRET` doit rester stable sur le serveur pour que cette URL continue à fonctionner après un redémarrage.

## Déploiement Hostinger

### Application Node.js

Dans hPanel :

1. Créer une application Node.js.
2. Choisir Node.js 18 ou une version LTS plus récente.
3. Utiliser le dossier du projet comme racine.
4. Utiliser `src/server.js` comme fichier de démarrage si Hostinger le demande.

Le projet n’a pas de dépendances npm à installer.

### Déployer le projet

```bash
git clone https://github.com/RomSom75/pick-my-next.git pick-my-next
cd pick-my-next
```

Ou téléverser les fichiers dans le dossier de l’application. Ne pas téléverser `.env` ni `data/config.json` dans un dépôt public.

### Variables d’environnement

Dans la configuration de l’application Node.js, définir :

```dotenv
PORT=3000
MDBLIST_API_KEY=ta_cle_mdblist
MDBLIST_LIST_IDS=
TMDB_READ_TOKEN=ta_cle_tmdb
TMDB_LANGUAGE=fr-FR
PICK_SECRET=une longue valeur aleatoire
```

`PICK_SECRET` doit être conservé dans les variables Hostinger. Ne pas le modifier après avoir généré des URLs d’installation.

### Sous-domaine HTTPS

Créer un sous-domaine, par exemple `pick.example.com`, le relier à l’application Node.js et activer SSL.

Vérifier ensuite :

```text
https://pick.example.com/health
```

Réponse attendue :

```json
{"ok":true,"service":"pick-my-next"}
```

Ouvrir ensuite `https://pick.example.com/configure`, vérifier les deux connexions, créer les catalogues et copier l’URL personnelle générée dans Nuvio. Elle ressemble à `https://pick.example.com/u/<token>/manifest.json`.

## Endpoints

| Méthode | URL | Rôle |
| --- | --- | --- |
| GET | `/health` | Vérifier le serveur |
| GET | `/configure` | Ouvrir le configurateur |
| GET | `/manifest.json` | Manifeste Stremio |
| GET | `/catalog/series/pick-next.json` | Catalogue sélectionné |
| POST | `/api/check` | Vérifier MDBList et TMDb |
| POST | `/api/config` | Enregistrer la configuration |
| POST | `/api/list-info` | Récupérer le nom d’une liste MDBList |
| POST | `/api/draw` | Nouveau tirage |

## Tests

```bash
node --test
```

## Sécurité

Ne jamais committer `.env` ou `data/config.json`. Utiliser HTTPS en production et régénérer toute clé exposée.
