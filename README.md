# Budget v4 — Mon Budget Personnel (PWA)

Version application web de ton classeur Excel « Mon Budget Personnel », fidèle à la logique du classeur : enveloppe quotidienne (jours × x €), report « Reste Mois-1 », répartition du Non Attribué (Livret A = LDDS = arrondi supérieur du tiers, reste vers Investissements), bilans Livrets / Investissements / Achat-Vente, historique de performance.

Tout fonctionne **hors ligne** après la première visite : les données restent sur ton appareil (IndexedDB), rien ne part sur un serveur.

## Contenu du dossier

| Fichier | Rôle |
|---|---|
| `index.html` | L'application complète (données de départ incluses) |
| `sw.js` | Service worker (cache hors ligne) |
| `manifest.webmanifest` | Manifeste PWA (installation sur l'écran d'accueil) |
| `icon-192.png` / `icon-512.png` | Icônes de l'app |
| `README.md` | Ce fichier |

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
- **Cours de bourse** : renseigne l'ISIN ou le ticker de chaque position (colonne 🔗), puis page Investissements → « 🔄 Mettre à jour les cours ». À la demande uniquement (usage mensuel typique) ; internet requis à ce moment-là. Il n'existe pas de synchronisation directe avec les comptes Trade Republic / Bourse Direct / BoursoBank (elle exigerait tes identifiants et un serveur) : la mise à jour des prix + tes quantités saisies donnent le même résultat.
- **Poches de répartition** : Réglages → 🪙. Chaque poche ventile le non attribué (1/3 ↑, % du NA, € fixe ou reste) vers le Livret A, le LDDS, le disponible d'investissement ou un simple suivi. Modifier les poches fige d'abord les mois passés : l'historique est intangible. L'enveloppe peut être un taux journalier ou un montant fixe mensuel (utile si tes livrets sont pleins ou si ton budget est forfaitaire).
- **Flux du mois** : diagramme des flux (entrées → budget → catégories) en tête de la page Mois.
- **Bulles ⓘ** : chaque fonction clé a son bouton d'information.
- **Saisie éclair** : carte « ⚡ Dépense rapide » sur l'Accueil et composeur en tête des dépenses libres du mois. Signe − automatique (« 12 » → −12 €), touche Entrée, expressions acceptées, suggestions d'intitulés, et **puces « libellé · dernier montant »** : un tap pré-remplit tout, il ne reste qu'à valider.
- **Journal des versions** : Réglages → 📜 Journal des versions (aussi dans CHANGELOG.md).
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
