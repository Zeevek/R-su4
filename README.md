# Budget v4 — Mon Budget Personnel (PWA)

Version application web de ton classeur Excel « Mon Budget Personnel », fidèle à la logique du classeur : enveloppe quotidienne (jours × 41,43 €), report « Reste Mois-1 », répartition du Non Attribué (Livret A = LDDS = arrondi supérieur du tiers, reste vers Investissements), bilans Livrets / Investissements / Achat-Vente, historique de performance.

Tout fonctionne **hors ligne** après la première visite : les données restent sur ton appareil (IndexedDB), rien ne part sur un serveur.

## Contenu du dossier

| Fichier | Rôle |
|---|---|
| `index.html` | L'application complète (données de départ incluses) |
| `sw.js` | Service worker (cache hors ligne) |
| `manifest.webmanifest` | Manifeste PWA (installation sur l'écran d'accueil) |
| `icon-192.png` / `icon-512.png` | Icônes de l'app |
| `README.md` | Ce fichier |

## Déploiement sur GitHub Pages

1. Sur github.com (compte **Zeevek**), crée un nouveau dépôt, par exemple `budget-v4` (public ou privé — Pages fonctionne dans les deux cas avec ton compte).
2. Téléverse les 5 fichiers **à la racine** du dépôt (bouton *Add file → Upload files*).
3. Va dans **Settings → Pages** : Source = *Deploy from a branch*, Branch = `main`, dossier `/ (root)`, puis *Save*.
4. Après une à deux minutes, l'app est en ligne sur `https://zeevek.github.io/budget-v4/`.

Pour mettre à jour l'app plus tard : remplace les fichiers dans le dépôt. Le service worker utilise un nom de cache versionné (`budget-v4-r2`) — pense à l'incrémenter dans `sw.js` à chaque mise à jour pour forcer le rafraîchissement chez les appareils déjà installés.

## Installation sur téléphone

- **iPhone / iPad (Safari)** : ouvre l'URL → bouton Partager → « Sur l'écran d'accueil ».
- **Android (Chrome)** : ouvre l'URL → menu ⋮ → « Installer l'application » (ou la bannière proposée).

Une fois installée, l'app s'ouvre en plein écran et fonctionne sans connexion.

## Données

- **Aucune donnée personnelle n'est embarquée** dans les fichiers du dépôt : au premier lancement, l'app est vierge (le mois calendaire en cours est créé, vide). Tes données du classeur sont livrées à part dans `budget-v4-donnees-personnelles.json` — **ne mets pas ce fichier sur GitHub** : importe-le une fois sur chaque appareil via Réglages → *Importer une sauvegarde JSON* (il est alors stocké en local dans IndexedDB).
- **Sauvegarde / restauration** : onglet Réglages → *Exporter JSON* (fichier de sauvegarde complet) et *Importer JSON*.
- **Import d'un classeur Excel** : onglet Réglages → *Importer un classeur .xlsx*. Cette fonction charge la bibliothèque de lecture à la volée depuis Internet : il faut donc être **en ligne la première fois** qu'on l'utilise (elle est ensuite mise en cache).
- **Tout effacer** : onglet Réglages → *Tout effacer* vide l'application sur l'appareil (réimporte ensuite ta sauvegarde JSON si besoin).

## Automatismes de saisie

- **Dépenses récurrentes** (charges fixes, abonnements obligatoires et loisirs, plans Trade Republic, montants PEA/PER) :
  - une ligne **ajoutée** dans un mois est ajoutée automatiquement à tous les mois suivants existants (jamais aux mois précédents) ;
  - une **modification** (intitulé ou montant) est répercutée sur les mois suivants **à venir** uniquement — l'historique déjà saisi n'est jamais réécrit ;
  - une **suppression** propose de retirer aussi la ligne des mois suivants à venir.
- **Étaler un paiement** (page Mois, sous les Paiements échelonnés) : indique l'intitulé, le total et le nombre de mois.
  L'app pose « Intitulé (1/n) … (n/n) » à partir du mois affiché, en mensualités égales arrondies au centime,
  la **dernière mensualité récupérant le reste des arrondis** (ex. 10 € / 3 mois → 3,33 · 3,33 · 3,34).
  Les mois manquants sont créés automatiquement (récurrents copiés).

## Compte rendu PDF

Onglet **Réglages → 🖨️ Compte rendu mensuel** : l'app génère une page A4 par mois (bilan, camembert des dépenses par catégorie, répartition d'épargne, entrées, plus grosses dépenses, investissements) et ouvre la boîte d'impression. Choisis « Enregistrer en PDF » comme destination — sur iPhone : Partager → Imprimer, puis pincer l'aperçu pour l'ouvrir en PDF et l'enregistrer dans Fichiers. Les mois passés et le mois en cours sont marqués « Réel », les suivants « Prévisionnel ».

## Logique reproduite (équivalences Excel → app)

- **Enveloppe du mois** = nombre de jours × 41,43 € (mai 2026 conserve sa valeur dérogatoire 1 242,90 €).
- **Reste Mois-1** : reporté automatiquement de mois en mois **jusqu'au mois calendaire en cours** — comme dans le classeur où la formule s'arrête à la feuille à jour. Les mois futurs partent de 0 et se remplissent tout seuls quand le mois arrive (pas de formule à tirer).
- **Non Attribué** = entrées (avec report) + charges fixes + abonnements obligatoires + investissements − enveloppe. Répartition : Livret A = LDDS = arrondi supérieur du tiers, le reste vers Investissements (mai garde sa répartition d'origine).
- **Cumuls Livret A / LDDS / Investissements** : additionnés du premier mois au mois calendaire en cours (équivalent des formules LET/REDUCE bornées à la feuille MàJ).
- **Total Sorties** n'inclut pas les vacances ; **Reste avec enveloppe** = enveloppe + loisirs + échelonnés + transport + dépenses libres + vacances + remboursements ; **Reste fin de mois** = solde + reste avec enveloppe.
- Les montants saisis acceptent les petites formules (`-8*4`, `12,5+3`), comme dans une cellule Excel.
