# Changelog — Budget v4

Toutes les évolutions notables de l'application. Le journal est aussi consultable dans l'app : Réglages → 📜 Journal des versions.

## v4.6.0 — 19/07/2026
- **Mise à jour des cours à la demande** : chaque position (Trade Republic, PEA, PERin) a une colonne 🔗 où saisir une fois son **ISIN** (ex. FR0000120271) ou son **ticker Yahoo** (ex. TTE.PA, BTC-EUR). Le bouton « 🔄 Mettre à jour les cours » (page Investissements) résout les ISIN vers le bon symbole (priorité aux places européennes en euros), récupère les derniers prix, convertit les cotations USD en euros, affiche la progression, mémorise le symbole résolu et signale les échecs. Connexion internet requise **uniquement à l'appui du bouton** — pensé pour un usage mensuel ; aucune donnée du portefeuille n'est transmise, seuls les symboles sont interrogés (cotations publiques Yahoo Finance, avec relais de secours).

## v4.5.0 — 18/07/2026
- **Optimisation Android / iOS** : champs de saisie à 16 px (fini le zoom automatique d'iOS), cibles tactiles agrandies, et bulles d'information **ⓘ** sur toutes les fonctions clés (reste du jour, répartition, étalement, récurrents, flux, livrets, positions…).
- **Étaler un paiement** est maintenant une option repliable **dans** les cartes Paiements échelonnés, Abo. obligatoires et Abo. loisirs ; les compteurs (n/N) avancent chaque mois dans les trois catégories.
- **Poches de répartition configurables** (Réglages → 🪙) : chaque poche a un mode (1/3 ↑, % du non attribué, € fixe, ou reste) et une destination (Livret A, LDDS, disponible d'investissement, ou suivi). Ajout, édition et suppression libres ; **les mois passés sont figés automatiquement** à chaque changement, l'historique ne bouge jamais. Une carte « 🧺 Poches d'épargne » sur la page Livrets cumule les poches de suivi.
- **Enveloppe au choix** : taux journalier (€/jour × jours du mois) ou **montant fixe mensuel** (Réglages).
- **Flux du mois** : diagramme façon Sankey en tête de la page Mois — entrées → budget → catégories, détail des investissements (TR/PEA/PER), épargne ou déficit.
- **Optimisation du code** : mémoïsation des calculs mensuels (rendu plus fluide), zéro duplication de fonctions ou de CSS.

## v4.4.0 — 18/07/2026
- **Saisie rapide des dépenses libres** : carte « ⚡ Dépense rapide » sur l'Accueil (écrit dans le mois en cours, créé au besoin) et composeur en tête de la liste sur la page Mois. Signe − ajouté automatiquement (« 12 » → −12 €, « +12 » reste positif), validation à la touche Entrée, expressions acceptées (« 7+3.5 »), suggestions d'intitulés tirées de l'historique (les plus fréquents d'abord).
- **Puces « libellé · dernier montant »** : un tap pré-remplit l'intitulé et le montant de la saisie rapide (Accueil et page Mois), à partir des libellés les plus fréquents de l'historique.
- Dépenses libres du mois affichées de la plus récente à la plus ancienne.
- **Journal des versions** dans Réglages + ce fichier CHANGELOG.md.

## v4.3.0 — 18/07/2026
- **Propagation automatique des dépenses récurrentes** (charges fixes, abonnements obligatoires et loisirs, plans Trade Republic, montants PEA/PER) : un ajout apparaît dans tous les mois suivants, une modification ou suppression n'est répercutée que sur les mois à venir — l'historique réel n'est jamais réécrit.
- **Aucune donnée personnelle dans le dépôt** : l'application démarre vierge ; les données se chargent une fois par appareil via une sauvegarde JSON conservée hors de GitHub.
- **Étalement des paiements échelonnés** : total ÷ nombre de mois arrondi au centime, la dernière mensualité récupère le reste des arrondis (ex. 10 € / 3 mois → 3,33 · 3,33 · 3,34), mois manquants créés automatiquement.

## v4.2.0 — 18/07/2026
- **Compte rendu imprimable / PDF** : une page A4 par mois (bilan, camembert des dépenses par catégorie, répartition d'épargne, entrées, plus grosses dépenses, investissements), badge Réel / Prévisionnel.

## v4.1.0 — 18/07/2026
- **Nouvelle icône** : logo personnalisé (bouclier, courbe de croissance, pièces et maison), zone sûre « maskable » respectée.

## v4.0.0 — 18/07/2026
- **Version initiale** : reprise fidèle du classeur Excel « Mon Budget Personnel » — budget mensuel (enveloppe 41,43 €/jour, report Reste Mois-1, répartition du Non Attribué en tiers arrondis au supérieur), livrets A/LDDS avec cumuls, investissements (positions TR/PEA/PERin, performance, historique et graphique), achat-vente, estimation de dépense par jour.
- **PWA 100 % hors-ligne** (IndexedDB), installable sur mobile, import de classeur .xlsx, sauvegarde et restauration JSON, montants acceptant les expressions (« -8*4 »).
