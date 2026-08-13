# Changelog — Budget v4

Toutes les évolutions notables de l'application. Le journal est aussi consultable dans l'app : Réglages → 📜 Journal des versions.

## v4.6.2 — 19/07/2026
- **Écran blanc au lancement corrigé** : la page Accueil avait perdu sa classe active — elle est rétablie, avec un filet de sécurité au démarrage.
- **Toutes les devises converties en euros** : JPY, CHF, HKD, GBP (et pence GBp ÷ 100), USD… Les taux de change sont récupérés **en direct à chaque appui** sur « Mettre à jour les cours » — jamais stockés, donc toujours du jour.
- **Import .xlsx — décalage de colonnes corrigé** : SheetJS indexe les colonnes depuis la plage *utilisée* de la feuille ; quand la colonne A est vide, tout se décalait d'un cran et les intitulés de positions devenaient des quantités. La lecture est désormais ancrée en A1 et les colonnes des positions sont relatives aux en-têtes. **Ré-importe ton classeur (ou ta sauvegarde JSON) pour réparer les positions corrompues.**
- **Symboles 🔗 conservés au ré-import** d'un classeur (appariement par intitulé) + date de dernière mise à jour des cours préservée.
- Produits non cotés (private equity, fonds fermés) : message explicite — leur prix se met à jour à la main.

## v7.5.0 — 13/08/2026
### Formulaires enfin lisibles
Les éditeurs de **projets**, de **comptes d'épargne** et de **poches de répartition** alignaient des cases numériques dont le seul repère était un texte d'aide… qui disparaît dès la saisie. Sur un projet immobilier, « 0 », « 3.5 » et « 20 » ne disaient plus rien : lequel est le prix, le taux, la durée ? Même problème pour les taux d'intérêt des livrets.

Chaque champ porte désormais une **étiquette permanente** au-dessus et son **unité** dans le champ :
- **Projets** : nom, prix du bien, frais (notaire, agence), taux d'emprunt en %, durée en années, apport déjà constitué — ou objectif et somme de côté pour un projet non immobilier.
- **Comptes** : nom, plafond légal en €, **taux d'intérêt annuel en %/an**, et solde avant le premier mois suivi (auparavant saisissable seulement depuis la page Épargne).
- **Poches** : nom, règle de calcul, valeur avec l'unité qui s'adapte au mode choisi (% ou €), destination de l'argent.

Chaque bloc se termine par son **bilan en clair** : pour un projet, l'apport constitué, l'emprunt nécessaire et la mensualité estimée ; pour un compte, la composition du solde (montant de départ + versements de la répartition + mouvements manuels), la place restante avant le plafond et les intérêts annuels estimés au taux saisi.

## v7.4.2 — 13/08/2026
- **Import : données et affichage séparés.** La restauration de sécurité se déclenchait dès la moindre erreur, y compris quand celle-ci survenait au moment de **dessiner l'interface**, alors que les données importées étaient parfaitement valides — c'est ce qui s'est produit avec le bug de la 7.4.0 : l'import était annulé pour un problème d'affichage. L'opération est maintenant en deux temps : intégration et enregistrement des données d'abord, rendu ensuite. Un échec au premier temps restaure l'état précédent ; un échec au second conserve l'import et propose de recharger la page.

## v7.4.1 — 13/08/2026
- **Correctif bloquant** : le bouton de pointage introduit en 7.4 référençait `it` au lieu de `item` dans la fonction qui construit **toutes** les lignes éditables. Conséquence : dès qu'une carte contenant des lignes devait s'afficher, le rendu s'interrompait — les pages Mois, Épargne et Achat-Vente apparaissaient vides, et le patrimoine restait à zéro. Une seule lettre, toute l'application paralysée.
- **Méthode de vérification renforcée** : jusqu'ici les contrôles portaient sur la syntaxe, les identifiants et le moteur de calcul — aucun ne construisait réellement l'interface. Le rendu complet est désormais rejoué **dans un navigateur simulé** (jsdom) avec une vraie sauvegarde : navigation entre les six onglets, saisie d'une dépense, transfert, opération d'achat, repli de carte, pointage. C'est ce test qui a mis ce bug en évidence en quelques secondes.

## v7.4.0 — 13/08/2026 — *refonte Achat-Vente et suivi transversal*

### Achat-Vente repensé
La page empilait deux tableaux à six colonnes (illisibles sur mobile), une carte de disponibles éclatée en trois, et **deux cartes portant exactement le même titre** — au point que replier l'une repliait l'autre. Elle est reconstruite autour de trois blocs :
1. **Un formulaire unique** : sens (achat / vente en deux gros boutons), compte, position choisie dans une liste, montant, prix unitaire facultatif, date. Un aperçu montre l'effet sur le disponible **et** sur la position avant validation.
2. **Un journal chronologique** de toutes les opérations, tous comptes confondus, en lignes lisibles sur mobile plutôt qu'en tableau à défilement horizontal.
3. **Une seule carte « D'où vient l'argent disponible »**, qui déroule le calcul poste par poste jusqu'aux trois soldes.

### Une opération met à jour le portefeuille
Enregistrer un achat ajoute les parts correspondantes à la position et **recalcule le prix de revient moyen pondéré** ; une vente retire les parts en laissant le PRU inchangé, sans jamais descendre sous zéro. Le prix unitaire est facultatif : à défaut, le dernier cours connu sert de référence. Fini la double saisie « j'achète, puis je corrige la ligne du portefeuille ».

### Suivi
- **Budgets par poste** : un plafond mensuel facultatif par catégorie, avec jauge sur la page Mois et **alerte de rythme** — au 10 du mois, avoir consommé la moitié d'un budget est signalé avant que le plafond ne soit atteint.
- **Bilan de l'année** sur l'Accueil : entrées, grandes catégories, investi, épargne totale, **taux d'épargne** et écarts avec l'année précédente ; sélecteur d'année dès qu'il y en a plusieurs.
- **Étiquettes** : un mot précédé de `#` dans un libellé (« Révision #voiture », « Croquettes #chat ») regroupe automatiquement les dépenses d'un même sujet **à travers les catégories et les mois** — ce que coûte réellement une voiture, un animal, un projet. Recherchables via 🔍.
- **Pointage bancaire** : chaque ligne porte un cercle qui devient une coche verte, pour cocher au fil du relevé.

### Confort
- **Profils multiples** : plusieurs budgets indépendants sur le même appareil (couple, ou perso / activité annexe), chacun avec ses propres mois, comptes et portefeuille dans un espace de stockage séparé.
- **Raccourcis clavier** : 1 à 6 pour les onglets, `n` pour saisir une dépense, `/` ou Ctrl+K pour rechercher, Ctrl+Z pour annuler, `?` pour l'aide.

## v7.3.0 — 13/08/2026 — *ouvrir l'application à tout le monde*

1. **Assistant de premier démarrage** — trois questions (revenus, budget de vie courante, comptes possédés, objectif) et l'application est configurée : enveloppe, comptes avec leurs plafonds, poches de répartition cohérentes avec la stratégie choisie (sécurité / équilibre / investissement), repli de plafond, et revenus pré-remplis dans le mois en cours. Fini l'écran vide avec des réglages hérités de quelqu'un d'autre.
2. **Mode démonstration** — six mois fictifs mais cohérents (salaire, loyer, courses, un mois de vacances, plans d'épargne, portefeuille, projet immobilier). Permet de tout essayer avant de saisir quoi que ce soit, ou de montrer l'application sans dévoiler ses finances. Les positions sont en « prix manuel » : aucun appel réseau.
3. **Annulation** — un bouton « Annuler » apparaît dans la confirmation après une suppression, un ajout ou un import. Plus besoin de ressaisir après une fausse manœuvre.
4. **Détection de doublon** — saisir deux fois le même libellé au même montant dans la même liste demande confirmation, au lieu de créer silencieusement la ligne en double (double tap sur mobile).
5. **Devise configurable** — euro, franc suisse, dollar US, dollar canadien, livre sterling, dirham, franc CFA : symbole, position et format numérique suivent. Les montants ne sont pas convertis, seul l'affichage change.
6. **Densité d'affichage** — compact (plus de lignes à l'écran), normal, ou confort (texte et cibles agrandis) : confort de lecture sur grand écran comme accessibilité.
7. **Tendances du mois** — sur l'Accueil, les postes qui s'écartent de plus de 25 % de leur moyenne des trois derniers mois, **au prorata du mois écoulé** (au 10 du mois, on ne compare pas un mois entier à un tiers de mois). Les petits montants sont ignorés pour éviter le bruit.
8. **Export CSV** — tous les mois, toutes catégories, en un fichier ouvrable dans Excel, Numbers ou LibreOffice (séparateur point-virgule, virgule décimale, BOM pour les accents).
9. **Import vérifié** — le fichier est contrôlé avant remplacement, son contenu est résumé (nombre de mois, période, comptes, positions), un fichier invalide est refusé avec une explication, et si l'import échoue en cours de route les données précédentes sont restaurées.
10. **Notification de mise à jour** — quand une nouvelle version est déployée, un message « Nouvelle version prête — recharger » s'affiche, au lieu de laisser l'utilisateur sur une version en cache sans le savoir (vérification horaire).

### Correction
- Un bloc de code JavaScript avait été inséré **à l'intérieur de la feuille de style** lors d'une modification automatique : la fonction existait en double, dont une copie inerte au milieu du CSS. Supprimée, et une vérification « pas de JavaScript dans le CSS » est ajoutée aux contrôles.

## v7.2.0 — 13/08/2026
### Sens de circulation de l'argent enfin explicite
La carte de transfert affichait deux menus identiques séparés d'une flèche : rien n'indiquait lequel était la source. Elle est repensée :
- deux blocs étiquetés **« ➖ L'argent part de »** (liseré rouge) et **« ➕ et arrive sur »** (liseré vert) ;
- un bouton **⇅ Inverser** pour permuter les deux d'un geste ;
- un **aperçu en direct** sous la saisie : chaque compte affiche son solde *avant → après* sur fond rouge pour celui qui se vide, vert pour celui qui se remplit — le sens devient évident avant même de valider ;
- le compte destinataire est initialisé sur un compte **différent** de la source ;
- les blocages (solde insuffisant, plafond du destinataire, comptes identiques) sont annoncés **pendant la saisie**.

### Interne
- Les contrôles de transfert sont factorisés dans une fonction unique utilisée à la fois par l'aperçu et par la validation : impossible que l'un accepte ce que l'autre refuse.
- Parcours complet rejoué sur la sauvegarde du 10/08 : migration d'une sauvegarde antérieure à la v6, soldes, cash PEA/PER, transferts, recherche, dossier IA et projection 30 ans — 24 vérifications, dont le solde exact du Livret A (1 438,51 €).

## v7.1.0 — 01/08/2026
### Corrections
- **Le bouton « Transférer » ne faisait rien** : le gestionnaire avait été placé dans la délégation des *modifications de champ* au lieu de celle des *clics* — un bouton n'émet pas d'événement de modification. Le transfert et ses raccourcis fonctionnent désormais.
- **Transfert vers le compte courant** : l'opération alimente maintenant les **remboursements du mois en cours** (montant positif, l'argent entre dans le budget) ; dans l'autre sens, du courant vers l'épargne, la ligne est négative.
- **Projection sur 30 ans** : le tableau s'arrêtait à 20 ans faute de jalons au-delà. Les échéances 25 et 30 ans sont ajoutées.
- **Plans Trade Republic** : les cinq listes (actions, ETF, métaux, crypto, private equity) sont désormais imbriquées dans la carte « Détail Trade Republic », qui portait son total sans rien contenir — l'ensemble se replie d'un seul geste.
- **Dépense rapide** : le menu déroulant de suggestions natif est retiré. Il masquait l'écran, proposait pêle-mêle des libellés à usage unique, et faisait double emploi avec les puces.

### Raccourci iOS / Android
Ouvrir l'application avec une adresse du type `?ajout=Boulangerie&montant=6` enregistre la dépense dans le mois en cours et l'annonce à l'écran, sans navigation. Sur iPhone, l'app **Raccourcis** permet d'en faire un bouton d'écran d'accueil ou une commande Siri ; le paramètre `&cat=` choisit la catégorie (transport, entrees, vacAlim…). L'adresse est nettoyée après enregistrement, donc recharger la page ne crée pas de doublon. Le mode d'emploi et le modèle d'adresse figurent dans Réglages → 📱.

## v7.0.0 — 01/08/2026 — *performance, transferts et recherche*

### Cours de bourse : 7 à 8 fois plus rapides
Trois causes de lenteur cumulées, toutes corrigées : les positions étaient traitées **une par une** (désormais par lots de 6 en parallèle), l'appel direct à Yahoo — systématiquement bloqué par CORS depuis GitHub Pages — était **retenté pour chaque ligne** (le relais qui fonctionne est maintenant mémorisé pour la session), et une pause de 120 ms séparait chaque position (supprimée, la limitation du parallélisme suffit). Le taux de change n'est demandé qu'une fois par devise même en parallèle. Mesure sur un cas de 37 positions : **13,7 s → 1,8 s**, et 68 requêtes inutiles économisées. Le temps écoulé s'affiche dans le message final.

### Transferts entre comptes
Nouvelle carte en tête de la page Épargne : choisir une source, une destination, un montant et un motif facultatif. L'opération est **écrite des deux côtés en une seule fois**, avec un libellé miroir daté. Destinations possibles : n'importe quel compte d'épargne, le disponible à investir, le cash PEA, le cash PER, ou une sortie vers l'extérieur. **Contrôles automatiques** : impossible de retirer plus que le solde disponible, ni de dépasser le plafond du compte destinataire. Des raccourcis proposent les mouvements pertinents (par exemple d'un livret plein vers un livret qui a encore de la place).

### Budget vacances activable
Une bascule en tête du bloc vacances de la page Mois : décochée, les **six cartes de détail disparaissent**. Les montants déjà saisis sont conservés et continuent de compter dans l'enveloppe — l'application demande confirmation avant de masquer un bloc non vide, et réaffiche automatiquement le bloc d'un mois qui contient des dépenses de vacances.

### Recherche globale
Un bouton 🔍 dans l'en-tête ouvre une recherche qui parcourt **tous les mois**, les mouvements de comptes et les positions (libellé ou ticker). Insensible à la casse et aux accents, résultats situés (mois, catégorie, montant) avec total, et un tap ouvre directement le mois concerné.

### Correction importante
- **Disponible à investir** : une ligne saisie dans « Sorties » **augmentait** le disponible au lieu de le diminuer. La convention est désormais celle du reste de l'application — le montant signé s'ajoute au solde (négatif = sortie, positif = entrée) — et la carte est renommée « Entrées / Sorties du disponible ». L'import de classeur inverse le signe des sorties en conséquence.
- Non-régression vérifiée : 17 agrégats identiques à la version précédente sur des données réelles.

## v6.1.0 — 01/08/2026
### Ergonomie
- **Cartes repliables** : un tap sur l'en-tête d'une carte replie ou déplie son contenu, le montant total restant visible dans l'en-tête. Le choix est mémorisé d'une session à l'autre. Les pages Mois (14 cartes) et Réglages (13 cartes) ne se parcourent plus en défilement continu. Au premier lancement, les cartes de configuration rarement touchées (Apparence, Verrouillage, Journal des versions, Compte rendu, Analyse IA, Zone sensible) sont repliées d'emblée.
- **Bouton ↑ de retour en haut**, affiché après quelques écrans de défilement.
- L'onglet **« Livrets » devient « Épargne »** : il regroupe maintenant l'ensemble des comptes, les poches de suivi et les projets.

### Correctifs
- **Doublon de données dans la sauvegarde** : depuis la refonte des comptes, les mouvements du Livret A et du LDDS étaient enregistrés à la fois dans `comptes` et dans l'ancien `livrets` — fichier inutilement gonflé et risque de divergence après un import. L'ancienne structure est supprimée une fois la reprise effectuée.
- Branche morte de saisie des montants initiaux supprimée (héritage de l'ancienne page Livrets).

## v6.0.0 — 01/08/2026 — *mise à jour majeure*

### Une application pour tout le monde
- **Comptes d'épargne libres** : la page Épargne n'est plus limitée au Livret A et au LDDS. Un catalogue permet d'ajouter d'un tap **LEP, Livret Jeune, PEL, CEL, compte à terme, livret bancaire, compte courant, espèces** ou un compte libre — chacun avec son **plafond réglementaire pré-rempli** (modifiable, les plafonds évoluant avec les années), son taux, sa **jauge de remplissage** et son solde.
- **Débordement automatique des plafonds** : quand un compte est plein, la part de la répartition qui lui était destinée est **redirigée vers le compte de repli** choisi dans les Réglages, au lieu d'être versée dans le vide. Conçu pour le cas où les livrets réglementés sont saturés : l'épargne continue de se placer sans intervention.
- **Projets** : achat immobilier (prix, frais, taux, durée → **emprunt nécessaire une fois l'apport déduit et mensualité estimée**) ou objectif libre (voyage, véhicule, matelas de sécurité). Chaque projet crée sa poche d'épargne dédiée et affiche sa progression ainsi que la date d'atteinte au rythme actuel.
- Toutes les destinations de poche sont désormais dynamiques : n'importe quel compte, le cash PEA/PER, un projet, ou le suivi simple.

### Analyse par une intelligence artificielle
- **Nouveau bouton « Dossier pour une IA »** (Réglages → 🤖) : génère un document Markdown structuré — situation patrimoniale compte par compte, flux des derniers mois, règle de répartition, portefeuille et allocation, performance TRI/TWR, projets — suivi d'une **question prête à l'emploi** selon l'angle choisi parmi six : diagnostic général, optimisation de l'épargne, réduction des dépenses, analyse du portefeuille, capacité d'emprunt, projection à 10 ans.
- Historique inclus paramétrable, **option d'anonymisation** (totaux seuls, sans libellé de dépense ni nom de position) avant de confier le document à un service tiers, export `.md` ou copie directe dans le presse-papier.

### Corrections et revue de code
- **Mois déficitaire** : lorsque les charges dépassent les entrées, l'application versait des montants **négatifs** sur les livrets. Elle ne répartit plus rien dans ce cas — le déficit reste lisible dans le solde et le reste de fin de mois. Visible surtout au premier démarrage, avant toute saisie.
- Fonction morte supprimée, règle CSS dupliquée fusionnée, aucun identifiant orphelin, exécution complète du script vérifiée hors navigateur.
- **Non-régression prouvée** : 17 agrégats comparés entre la v5.6 et la v6.0 sur des données réelles — aucun écart.

## v5.6.0 — 01/08/2026
- **Le cash PEA / PER rejoint ses comptes** : les poches « 📈 PEA » et « 🛡️ PER » étaient traitées comme des tirelires de suivi indépendantes, alors qu'il s'agit de cash destiné à ces comptes — en supplément des versements mensuels programmés, eux prélevés sur le budget du mois. Deux nouvelles destinations apparaissent dans la répartition : **« → Cash PEA »** et **« → Cash PER »**. Les poches déjà créées (ainsi que leur répartition figée dans l'historique) sont basculées automatiquement à l'ouverture.
- **Un disponible par compte** (page Achat-Vente) : 💵 Dispo TR général, 📈 Cash PEA, 🛡️ Cash PER, et le total. Une carte détaille chaque compte : mis de côté par les poches, moins ce qui a été consommé, égale le cash restant. Les **achats directs PEA** puisent d'abord dans le cash PEA ; si l'achat le dépasse, le complément est pris sur le disponible général — exactement le comportement d'avant lorsqu'aucune poche dédiée n'existe (vérifié : 16 agrégats identiques à la version précédente sur les données réelles).
- **PER — versements exceptionnels** : une nouvelle liste permet d'enregistrer un versement réel, qui consomme le cash PER mis de côté.
- **Patrimoine total** : l'Accueil additionne désormais les trois disponibles, et détaille le cash PEA et PER quand il y en a.

## v5.5.1 — 22/07/2026
- **Page Investissements lisible en thème sombre** : les pastilles de catégorie gardaient un texte clair sur leur fond pastel clair (illisible la nuit) — chaque pastille a désormais son encre foncée assortie (Actions vert sapin, ETFs bleu marine, Cryptos ocre, Métaux terre cuite, Private Equity violet, Obligations ardoise), identique sur tous les thèmes. La ligne TOTAL des tableaux suit le thème (bandeau + liseré doré) au lieu d'un crème codé en dur, les prix « manuel » 🔒 et le sélecteur de tri sont adoucis.

## v5.5.0 — 22/07/2026
- **Sous-catégories vacances dans la saisie rapide** : choisir « 🏖️ Vacances… » fait apparaître un second menu — 🏨 Hôtel / Airbnb, ✈️ Transport, 🍽️ Alimentation, 🎢 Loisirs, 📦 Autres, 💶 Remboursement reçu. Le menu principal garde une seule ligne vacances au lieu de six.
- **Nouveau poste « Vacances · Remboursements reçus »** (montants positifs, ex. la part d'un ami sur l'Airbnb) : il vient en déduction du total vacances partout — page Mois (carte dédiée), bilan, diagramme des flux, compte rendu PDF. Les sauvegardes existantes reçoivent le poste automatiquement à l'import, sans changement d'aucun chiffre (vérifié sur tes données réelles : reste fin de mois 642,07 € inchangé).

## v5.4.0 — 22/07/2026
- **Dépense rapide avec destination** : un menu déroulant sous la barre de saisie choisit où va la ligne — 🛒 Dépenses libres (défaut), 🚗 Transport, 🏖️ Vacances, 🏠 Charge fixe, 📱 Abo obligatoire, 🎮 Abo loisir, 💳 Échelonné, 💵 Entrée d'argent ou 🔁 Remboursement. Le signe suit la nature de la destination (« 12 » devient −12 € en dépense, +12 € en entrée), les catégories récurrentes se propagent aux mois suivants avec le toast « ↪ n mois », et taper une puce ramène la destination sur Dépenses libres.
- **Poches préconfigurées** : dans Réglages → 🪙, les raccourcis **＋ 📈 PEA**, **＋ 🛡️ PER** et **＋ 🎯 Projet** ajoutent une poche d'un tap — en mode part égale (1/3 → 1/4 automatiquement), insérée avant la poche « reste », en destination « suivi » dont le cumul apparaît sur la page Livrets. Doublons refusés, historique figé, effet à partir du mois prochain ; mode et destination restent modifiables ensuite.

## v5.3.0 — 22/07/2026
- **Revue de code** : suppression des fonctions et constantes mortes accumulées au fil des versions (`normaliserCotation`, `finDuMois`, `periodeDepuisCle`, `THEMES_SOMBRES`), et l'enrichissement de l'historique n'est plus exécuté deux fois à chaque démarrage.
- **Performance** : la simulation de projection (600 trajectoires Monte-Carlo) est désormais mise en cache et invalidée avec les autres calculs — la page Investissements ne la recalculait pas moins de… à chaque frappe dans une position.
- **Protection des données** : une ligne dont le libellé contient une date (« Dividende TotalEnergie (02/07/2026) ») n'est plus propagée aux mois suivants par le mécanisme des récurrents — un dividende daté est ponctuel par nature. Les lignes normales (« Loyer ») se propagent comme avant.
- **Validé sur données réelles** : la suite de tests (313) rejoue désormais la sauvegarde du 22/07 et vérifie que le moteur reproduit exactement les chiffres affichés sur le téléphone (reste fin de mois 642,07 €).

## v5.2.2 — 22/07/2026
- **Croix ✕ des puces réparée** : la croix est un élément *à l'intérieur* du bouton de puce, or le gestionnaire de clic remontait d'abord au bouton puis cherchait la croix parmi ses ancêtres — jamais trouvée, le tap remplissait donc la saisie au lieu de masquer. Le gestionnaire part maintenant de la cible réelle du clic.
- **Case « aujourd'hui » lisible en thème sombre** : le fond crème codé en dur rendait les chiffres invisibles la nuit ; en clair les chiffres passent en doré foncé, en sombre la case devient dorée translucide avec chiffres dorés.

## v5.2.1 — 22/07/2026
- **Correctif critique de la v5.2.0** : le gestionnaire du bouton « ♻️ Réafficher les puces » référençait un bouton jamais inséré dans la page — l'erreur stoppait le script en plein vol : navigation active mais thème, Face ID, export et tout le rendu initial inertes (écrans vides). Le bouton est rétabli, les lignes de code égarées dans le gestionnaire de tri sont nettoyées, et **un test d'intégrité permanent** vérifie désormais que chaque élément référencé par le script existe dans la page.
- **Thème sombre cohérent** : la barre de navigation, les bandeaux de cartes, le héro, les boutons et le toast restaient clairs en thème sombre (ils reposaient sur la couleur d'encre, qui devient claire la nuit). Tous utilisent maintenant les variables d'en-tête du thème.
- **Filet de sécurité visible** : toute erreur de script s'affiche en haut de l'écran (« ⚠️ Erreur : … ») — plus jamais d'app muette sans explication.

## v5.2.0 — 22/07/2026
- **Verrouillage à l'ouverture** (Réglages → 🔐) : l'app demande **Face ID / Touch ID** via le trousseau du téléphone (API WebAuthn — c'est la voie offerte aux applications web, l'option « Exiger Face ID » du menu iOS étant réservée aux apps de l'App Store). Un **code de secours** à 4-6 chiffres prend le relais si la biométrie échoue ou n'est pas disponible. Reverrouillage automatique après 2 minutes en arrière-plan. Honnêteté oblige : c'est un verrou d'écran qui décourage l'accès de passage — les données restent stockées en clair dans le navigateur.
- **Rappel de sauvegarde hebdomadaire** : chaque lundi, une fenêtre rappelle d'exporter la sauvegarde JSON, avec le bouton d'export intégré. Elle ne s'affiche qu'une fois par lundi, et pas du tout si l'export du jour est déjà fait.
- **Thèmes** (Réglages → 🎨) : *Automatique* (suit le mode clair/sombre du téléphone, et bascule en direct), *Clair*, *Sombre*, *Forêt* (clair, accents verts) et *Minuit* (bleu nuit et or). Les diagrammes (flux, camemberts, projections) suivent le thème ; le compte rendu PDF reste toujours clair pour l'impression.

## v5.1.0 — 22/07/2026
- **Puces de saisie rapide masquables** : chaque puce « libellé · dernier montant » porte une petite croix ✕ — un tap la retire des suggestions (avec confirmation). Le libellé reste disponible dans l'auto-complétion à la saisie. Un bouton ♻️ dans Réglages → Paramètres réaffiche toutes les puces masquées d'un coup.

## v5.0.0 — 19/07/2026
- **Socle d'analyse** : le bouton « Enregistrer » mémorise désormais, en plus de la performance, la **valeur du portefeuille** et les **apports du mois** par compte — tout est déduit du budget (plans mensuels, achats directs) et des positions, sans une seule saisie de plus. Les périodes déjà enregistrées sont complétées rétroactivement au premier lancement.
- **Performance réelle (TRI / TWR)** : le TRI donne le taux annuel réellement obtenu compte tenu du calendrier des versements ; le TWR neutralise cet effet et se compare à un indice. Un écart entre les deux indique si les versements sont tombés à des moments favorables.
- **Projection du patrimoine** : trois scénarios (pessimiste / neutre / optimiste) bâtis sur l'allocation réelle par catégorie et des taux conventionnels par classe d'actifs, complétés d'un **faisceau P10/P50/P90** par simulation (600 trajectoires, graine fixe pour un affichage stable). À mesure que l'historique s'allonge, la performance observée remplace progressivement la théorie (poids n/(n+36), borné à ±30 % pour éviter d'extrapoler un bon mois).
- **Corrections** : trois implémentations concurrentes du socle s'étaient empilées au fil des versions — une seule subsiste. Les achats directs étaient comptés deux fois dans le capital investi et absents des apports, ce qui les faisait passer pour une hausse du marché dans le calcul de performance.

## v4.11.0 — 19/07/2026
- **Résolution des symboles renforcée** : un code crypto court est complété automatiquement (SOL → SOL-EUR, puis -USD), un ticker déjà complet est testé tel quel, et un ISIN que la recherche Yahoo ne connaît pas est retenté via le point d'entrée « lookup ».
- **Mode « prix manuel »** : inscrire `manuel` (ou `-`) dans la colonne 🔗 exclut la position de la mise à jour automatique. Elle s'affiche en gris avec un 🔒 et n'est plus comptée parmi les lignes à revoir — pensé pour le private equity et les fonds evergreen non cotés.
- **Messages d'échec plus utiles** : ils suggèrent désormais quoi essayer (ticker de la place de cotation, paire crypto en euros, ou passage en prix manuel).
- **Correction du numéro de version** affiché dans l'en-tête, resté bloqué sur 4.6.2 depuis plusieurs mises à jour.

## v4.10.0 — 19/07/2026
- **Repérage visuel des cours à mettre à jour à la main** : dans les tableaux de positions, la colonne Prix prend une teinte ambrée avec une barre dorée lorsque la valeur n'a pas été rafraîchie lors de la dernière mise à jour automatique (ISIN absent ou récupération en échec), une teinte verte lorsque tu l'as saisie manuellement depuis cette mise à jour, et reste neutre lorsqu'elle est à jour. Un compteur sous le bouton « Mettre à jour les cours » résume les trois états, et chaque cellule porte une infobulle explicative.

## v4.9.0 — 19/07/2026
- **Paramètres appliqués au mois suivant** : modifier le montant journalier, l'enveloppe fixe ou les poches de répartition n'affecte plus le mois en cours — il garde les valeurs avec lesquelles il a été engagé. Les nouvelles règles démarrent au mois suivant, ce qui permet de préparer un changement à l'avance.
- **Quantités à 6 décimales** : les fractions d'actions et de cryptos (2,123849 · 0,011264) sont conservées à la saisie, affichées sans zéros superflus et reprises telles quelles dans le relevé PDF ; la colonne a été élargie en conséquence.
- **Tri des portefeuilles** : chaque compte (TR, PEA, PERin) dispose d'un sélecteur — ordre de saisie, intitulé A→Z (insensible aux accents et à la casse), catégorie, valeur, performance en € ou en %, quantité. Le choix est mémorisé par compte, et l'édition reste liée à la bonne position quel que soit le tri affiché.

## v4.8.0 — 19/07/2026
- **Saisie uniformisée partout** : chaque carte de liste (charges fixes, abonnements, transport, dépenses libres, vacances, plans Trade Republic, mouvements de livret…) dispose de la même barre rapide « intitulé + montant + ＋ ». Signe automatique selon la nature de la carte, touche Entrée pour passer au montant puis valider, focus rendu à l'intitulé pour enchaîner, et propagation aux mois suivants pour les catégories récurrentes.
- **Répartition adaptative** : le mode « part égale » calcule sa fraction selon le nombre de poches — 2 poches + reste → 1/3 chacune, 3 poches + reste → 1/4, 1 poche + reste → 1/2. Ajouter un portefeuille à la répartition suffit, les fractions se réajustent seules et le libellé affiché suit (« 1/4 ↑ »).
- **Paramètres appliqués vers l'avenir** : modifier le montant journalier, l'enveloppe fixe ou les poches n'affecte que le mois en cours et les suivants ; les mois écoulés sont figés automatiquement avec les valeurs réellement vécues.
- **Positions personnalisables** : intitulé modifiable et catégorie au choix parmi Actions, ETFs, Métaux / ETC, Private Equity, Obligations et Cryptos, chacune avec sa couleur — reprise dans les tableaux et le compte rendu.
- **Relevé de portefeuille dans le PDF** : page finale du compte rendu avec les positions détaillées par compte (quantité, PRU, cours, valeur, performance), la répartition par catégorie en camembert et l'historique de performance.
- **Réparation des positions décalées** (Réglages → 🔧) : remet en place les colonnes quand un import a fait glisser intitulé, quantité et PRU d'un cran, en conservant le prix et l'ISIN et en devinant la catégorie.

## v4.7.0 — 19/07/2026
- **Correctif iOS — écran blanc au lancement** : Safari pouvait rester bloqué à une échelle de zoom > 1 (conséquence du zoom automatique sur les champs), l'app apparaissant alors vide et figée. Désormais : tous les champs sont à 16 px sur mobile (le zoom automatique ne se déclenche plus), et l'app force le retour à l'échelle 1 à l'ouverture, au changement d'orientation, au retour d'arrière-plan et après chaque saisie.
- **Cours de bourse multi-devises** : JPY, HKD, CHF, GBP, USD et toutes les autres sont prises en charge. Le taux de change est récupéré **en direct à chaque mise à jour** (une seule requête par devise, jamais de taux périmé), avec repli sur le sens inverse de la paire si nécessaire. Les cotations de Londres en **pence (GBp)** sont divisées par 100 automatiquement. Les taux appliqués sont affichés sous le bouton (« 1 JPY = 0,0057 € ») et les échecs mentionnent l'ISIN concerné plutôt qu'un libellé ambigu.

## v4.6.1 — 19/07/2026
- **Correctif iOS — zoom automatique à la saisie** : la règle 16 px s'applique désormais à *tous* les champs sur mobile (`!important` : elle écrase aussi les tailles définies en style inline, comme la colonne ISIN qui restait à 11 px et déclenchait le zoom). Le verrou `maximum-scale` n'est posé que sur iOS (où le pincement manuel reste possible) pour ne pas priver Android du zoom au geste. Et si un zoom résiduel survenait malgré tout, l'app dézoome automatiquement à la fin de la saisie.

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
