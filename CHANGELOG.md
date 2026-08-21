# Changelog — Budget v4

Toutes les évolutions notables de l'application. Le journal est aussi consultable dans l'app : Réglages → 📜 Journal des versions.

> Ce journal est public : il décrit les évolutions de l'application sans citer de
> montants réels, de noms de comptes ni d'établissements. Les exemples chiffrés y
> sont fictifs ou génériques.

## v10.2.1 — 21/08/2026 — *revue de code : sécurité et robustesse*
- **Sécurité : champs numériques non échappés.** Le montant d'une ligne, le prix/PRU/quantité d'une position, le plafond/taux d'un compte, ainsi que le prix/taux/durée d'un projet, étaient injectés tels quels dans le HTML au lieu de passer par l'échappement déjà utilisé pour les intitulés. Une sauvegarde JSON trafiquée (partagée, récupérée, modifiée à la main) aurait pu y injecter du code exécuté à l'affichage. Corrigé : ces champs passent désormais par le même échappement que le reste.
- **Intégrité du lecteur Excel.** La bibliothèque SheetJS, chargée depuis un CDN au premier import `.xlsx`, est maintenant vérifiée par hash (SRI) avant exécution : une compromission du CDN ne permettrait plus d'exécuter du code arbitraire à cette occasion.
- **Correctif : répartition du Non Attribué sans poche « reste ».** Chaque poche en mode « part »/« pct » arrondit à la hausse ; sans poche « reste » pour absorber cet arrondi, la somme distribuée pouvait dépasser le Non Attribué réel. L'écart est désormais résorbé sur la dernière poche concernée.
- **Correctif : jauge de l'Accueil à NaN** quand l'enveloppe du mois est nulle.
- **Correctif : bloc Dividendes de l'Accueil construit deux fois** à chaque rafraîchissement (sans impact visible, coût de rendu inutile).
- **Service worker : page principale en réseau d'abord.** `index.html` était servi en cache d'abord uniquement — un oubli d'incrémenter le nom du cache lors d'un déploiement laissait les appareils déjà installés bloqués indéfiniment sur une ancienne version. Le service worker vérifie maintenant le réseau en premier pour la page principale, avec repli sur le cache hors ligne ; les autres fichiers (icônes, manifeste) restent en cache d'abord.
- **Thème sombre : couleurs codées en dur corrigées** sur les cellules de prix des tableaux de positions et sur l'état « actif » des puces de suggestion, qui restaient en fond clair quel que soit le thème.
- **Transparence : relais de cours de bourse.** L'aide « Mise à jour des cours » précise désormais que la requête peut transiter par un relais tiers (allorigins.win, corsproxy.io) pour contourner le blocage CORS de Yahoo Finance — ce relais voit alors le symbole demandé, mais aucune autre donnée du portefeuille.

## v10.2.0 — 21/08/2026
- **Étiquettes : le coût net.** Une dépense et un remboursement portant la même étiquette ne se compensaient pas dans le diagramme de flux : seules les lignes négatives étaient comptées. Un abonnement partagé de 29,25 € dont 17,70 € sont reversés apparaissait donc à son coût brut. Le diagramme affiche maintenant le **net**, cohérent avec la carte Étiquettes qui, elle, déduisait déjà les remboursements — les deux lectures se contredisaient.
- **Étiquettes analysées, plus seulement cumulées.** La carte de l'Accueil listait des totaux sur douze mois, sans point de comparaison. Chaque sujet est désormais traité comme un poste de dépense : montant du mois, montant habituel au même stade, écart en pourcentage, barres comparatives et projection de fin de mois. Un sujet apparu récemment est signalé « nouveau » plutôt que comparé à zéro.
- **Suggestion d'étiquettes à la saisie.** Taper « # » dans n'importe quel champ de libellé propose les étiquettes déjà utilisées, classées par fréquence d'usage. La recherche ignore les accents — « #tele » trouve « #télépayage » — ce qui évite de créer par mégarde deux sujets pour la même chose. Navigation aux flèches, validation par Entrée ou Tab, insertion au clic.
- **Correctif : replis perdus.** Replier des cartes puis changer l'horizon d'un graphique, trier des positions ou changer de mois les rouvrait toutes : ces actions reconstruisent la page sans repasser par la fonction qui restaure l'état replié. Les fonctions de rendu l'appliquent maintenant elles-mêmes, ce qui règle le cas pour toutes les interactions, présentes et à venir.

## v10.1.0 — 20/08/2026
- **Barre de mois masquée par l'en-tête.** Elle se cale sur une variable contenant la hauteur de l'en-tête, mesurée une seule fois au chargement. Or cette hauteur **varie** : barre d'état iOS, passage en mode compact au défilement, rotation de l'écran. Une mesure prise pendant que l'en-tête était compact donnait une valeur trop faible, et l'en-tête déplié recouvrait alors le nom du mois et ses boutons. La hauteur est maintenant relevée à chaque changement — défilement, fin de transition, redimensionnement, rotation, chargement des polices — et une valeur de repli s'applique si la mesure échoue.
- **Bloc « Raccourci iOS / Android » retiré.** Le procédé (ouvrir l'application avec des paramètres d'adresse pour enregistrer une dépense) ne fonctionnait pas de façon fiable selon les navigateurs et les versions. Le code associé et son aide ont été supprimés avec lui. La saisie rapide par le bouton ＋ reste le moyen le plus direct.

## v10.0.1 — 20/08/2026
- **Nouvelle icône.** Déclinée dans toutes les tailles utiles : 192, 256, 512 et 1024 px pour les systèmes de bureau, une vignette de 180 px pour l'écran d'accueil iOS, et deux versions **« maskable »** pour Android. Ces dernières placent le motif dans les 78 % centraux, sur un fond assorti au thème : les masques circulaires ou en goutte appliqués par le système rognent jusqu'à un cinquième de chaque bord sans amputer le dessin. Le fin liseré clair qui entourait l'image d'origine a été détouré, faute de quoi il serait apparu comme une bordure grise.
- Les captures d'écran de l'invite d'installation reprennent la nouvelle icône.

## v10.0.0 — 20/08/2026 — *installation sur ordinateur*

L'application était installable sur téléphone mais son manifeste ne permettait pas une installation propre sur ordinateur : orientation forcée en portrait, aucune capture d'écran (nécessaire à l'invite enrichie de Chrome et Edge), icônes déclarées « maskable » sans respecter la zone de sécurité, couleurs de thème héritées de l'ancienne identité.

### Manifeste complet
Identifiant stable, `display_override` (dont le mode fenêtre avec superposition des contrôles), orientation libre, couleurs de la charte, catégories, langue, et reprise du focus si une fenêtre est déjà ouverte. **Six icônes** : quatre classiques (192 à 1024 px, cette dernière pour l'affichage macOS) et deux « maskable » dont le motif tient dans la zone sûre, pour ne pas être rogné par les masques d'Android. **Deux captures d'écran** (large et étroite) alimentent l'invite d'installation. **Trois raccourcis** apparaissent au clic droit sur l'icône : saisir une dépense, ouvrir le mois, ouvrir le portefeuille.

### Carte « Installer l'application »
Dans Réglages → Confort et sécurité. Sur Chrome et Edge, l'invite native est captée et un bouton lance l'installation en un clic. Ailleurs, la marche à suivre s'adapte à la plateforme détectée :
- **Windows** — icône d'installation dans la barre d'adresse, ou menu ⋮ → Applications ;
- **macOS** — Safari 17 : Fichier → « Ajouter au Dock… » ; alternative Chrome/Edge ;
- **iPhone / iPad** — Partager → « Sur l'écran d'accueil » ;
- **Android** — menu ⋮ → « Installer l'application » ;
- **Linux** — icône d'installation ou menu ⋮.

Firefox pour ordinateur ne prenant pas en charge l'installation des applications web, la limitation est signalée plutôt que laissée à deviner. Une fois installée, la carte le confirme au lieu de proposer l'opération.

### Précision sur les données
Les données restent celles du navigateur qui a servi à l'installer : elles ne sont ni copiées ni synchronisées. Pour passer d'un appareil ou d'un navigateur à un autre, l'export et l'import de sauvegarde restent la voie à suivre.

## v9.9.1 — 20/08/2026
- **Journal des versions expurgé.** Ce fichier est publié sur le dépôt : il contenait des montants réels (soldes, revenus, patrimoine), des noms d'établissements et un prénom. Tous les exemples chiffrés sont devenus génériques, sans que le raisonnement décrit y perde quoi que ce soit. Les 55 versions sont conservées.
- **Interface rendue générique.** Les noms d'établissements étaient codés en dur dans l'application (nom du courtier, de l'assureur, du compte-titres) et un prénom servait d'exemple dans la saisie des remboursements de vacances. Ils laissent place à des libellés neutres — **compte-titres**, **PEA**, **PER**, « part d'un proche ». Les identifiants internes sont inchangés : aucune sauvegarde n'est affectée.
- **README nettoyé** des mêmes mentions.

## v4.6.2 — 19/07/2026
- **Écran blanc au lancement corrigé** : la page Accueil avait perdu sa classe active — elle est rétablie, avec un filet de sécurité au démarrage.
- **Toutes les devises converties en euros** : JPY, CHF, HKD, GBP (et pence GBp ÷ 100), USD… Les taux de change sont récupérés **en direct à chaque appui** sur « Mettre à jour les cours » — jamais stockés, donc toujours du jour.
- **Import .xlsx — décalage de colonnes corrigé** : SheetJS indexe les colonnes depuis la plage *utilisée* de la feuille ; quand la colonne A est vide, tout se décalait d'un cran et les intitulés de positions devenaient des quantités. La lecture est désormais ancrée en A1 et les colonnes des positions sont relatives aux en-têtes. **Ré-importe le classeur (ou une sauvegarde JSON) pour réparer les positions corrompues.**
- **Symboles 🔗 conservés au ré-import** d'un classeur (appariement par intitulé) + date de dernière mise à jour des cours préservée.
- Produits non cotés (private equity, fonds fermés) : message explicite — leur prix se met à jour à la main.

## v9.9.0 — 20/08/2026
- **Saisie rapide recentrée.** Le bouton ＋ ne propose plus que la dépense ou l'entrée : un dividende demande une date de perception, un choix net ou brut et un taux, ce qui alourdissait une feuille conçue pour saisir en trois secondes. Il se saisit dans sa carte, où ces éléments ont leur contexte.
- **Diagramme « Rythme des dividendes ».** Les encaissements mois par mois, positionnés à leur **date réelle de perception** et non au mois de rattachement comptable. Quand une année précédente existe, ses montants apparaissent en barre claire derrière, et la note compare les cumuls **à la même date** — comparer un mois d'août partiel à une année complète n'aurait aucun sens. Les dividendes étant très saisonniers, cette lecture est plus parlante qu'un total annuel. Un sélecteur permet de revenir sur les années précédentes.
- **Correctif : boucle sans fin.** Enregistrer un dividende daté d'avant le premier mois suivi déclenchait `while (!etat.months[cle]) creerMoisSuivant()` — or les mois ne se créent que vers l'avant : la condition ne pouvait jamais devenir vraie et **l'application se figeait**. Quatre boucles de ce type existaient (dividendes, saisie rapide, raccourci URL, étalement). Toutes passent par une fonction unique qui borne les créations et retourne un échec propre, avec un message indiquant le premier mois disponible.

## v9.8.1 — 20/08/2026
### Taux d'épargne faux
Il valait `(reste de fin de mois + investi) / entrées`, ce qui pose deux problèmes : le reste de fin de mois contient déjà une part de l'enveloppe non dépensée, donc l'addition **compte deux fois** une partie de la somme ; et les entrées incluent le **report du mois précédent**, qui n'est pas un revenu du mois. Sur août, cela donnait 69 % au lieu de 62 %.

La formule devient celle qui fait consensus : la part des revenus qui n'est pas consommée.
- Revenus du mois = entrées − report du mois précédent
- Consommation = charges + abonnements + échelonnés + transport + dépenses libres + vacances
- Épargne = revenus − consommation, et le taux en est le rapport

Selon les cas, l'écart avec l'ancienne formule atteint plusieurs points. La tuile affiche désormais le détail (« X non consommés sur Y de revenus ») pour que le chiffre soit vérifiable d'un coup d'œil.

### Carte des dividendes
Les styles de la carte avaient été emportés par un nettoyage de feuille de style : le résumé, la frise et le journal s'affichaient en texte brut empilé. Ils sont rétablis. La **frise des douze mois est supprimée** : sur une année à cinq versements, douze barres presque vides n'apprenaient rien. Et le journal se limite aux **trois derniers versements**, avec un rappel du total annuel et un renvoi vers la recherche pour retrouver les autres — au-delà, la carte devenait un mur.

## v9.8.0 — 20/08/2026 — *pertinence des indicateurs*

### Une incohérence de chiffres
La tuile « Investissements » affichait la **valeur de marché** tandis que la carte Patrimoine, quelques centimètres plus bas, affichait le **prix de revient** — deux chiffres pour la même chose sur le même écran. Tout est désormais compté à la **valeur de marché**, c'est-à-dire ce qu'on obtiendrait en vendant aujourd'hui, avec le prix de revient et la plus-value en sous-ligne.

### Tuiles de l'Accueil
« Solde du mois » et « Reste fin de mois » mesuraient deux choses voisines sans qu'on puisse les distinguer, et « Épargne » + « Investissements » redisaient ce que la carte Patrimoine détaille déjà. Les quatre tuiles deviennent :
- **Reste fin de mois** — ce qui restera une fois tout passé ;
- **Taux d'épargne** — la part des entrées mise de côté ce mois-ci, l'indicateur le plus prédictif du patrimoine à long terme ;
- **Patrimoine net** — un chiffre unique, identique à celui de la carte détaillée ;
- **Performance** — la plus-value latente en pourcentage et en euros, seule tuile où le vert signale un vrai gain.

### Bilan du mois
Six tuiles dont deux faisaient doublon avec la barre de mois collante, qui affiche déjà « solde … · reste … ». Il en reste quatre, chacune avec un sous-titre explicatif : entrées, sorties, **reste à dépenser** (rapporté à l'enveloppe) et investi.

### Dividendes depuis le bouton ＋
La feuille de saisie rapide propose maintenant deux natures : **dépense ou entrée**, et **dividende perçu**. Le second mode affiche la date de perception, le choix net ou brut avec son taux de prélèvements, et annonce le mois de rattachement avant validation. La feuille revient toujours sur « dépense » à l'ouverture, cas de loin le plus fréquent.

## v9.7.1 — 20/08/2026
- **Listes déroulantes nommées.** Le correctif précédent n'avait couvert que les champs de texte : les 48 recommandations restantes venaient des `<select>` générés (catégorie d'une position, règle de calcul et destination d'une poche, tri, comptes de transfert). Ils portent désormais un nom. Mon propre contrôle avait le même angle mort — il ne vérifiait que les `<input>` — et couvre maintenant listes et zones de texte.

**Bilan de la console du navigateur** : de 6 erreurs et 111 recommandations à **zéro de chaque**.

## v9.7.0 — 20/08/2026 — *corrections issues de la console du navigateur*

### Le mode hors ligne ne fonctionnait pas
Le service worker mettait ses fichiers en cache avec `addAll`, qui **échoue en bloc dès qu'un seul fichier est absent**. Sur le dépôt de test, le manifeste et les icônes n'étant pas publiés, l'installation échouait entièrement : **rien n'était mis en cache**, alors que l'en-tête affichait « hors-ligne prêt ». La mise en cache distingue maintenant l'indispensable (la page elle-même) de l'accessoire (manifeste, icônes), tenté fichier par fichier sans bloquer le reste. L'application vérifie ensuite que le cache existe réellement et affiche « cache incomplet » le cas échéant, plutôt qu'une promesse fausse. Une navigation hors ligne vers une adresse inconnue retombe sur la page principale.

### Faux champs de saisie
Les intitulés des listes (« Enveloppe quotidienne », « Total cumulé »…) étaient des `<input readonly>` — un détournement qui expliquait à lui seul **110 avertissements** du navigateur et alourdissait la page de 63 éléments de formulaire inutiles. Ce sont désormais de simples textes.

### Divers signalements
- Un bouton d'aide se trouvait **à l'intérieur d'un titre dépliant**, ce qui perturbe la navigation au clavier et les lecteurs d'écran : il devient un indicateur non interactif.
- Une étiquette « Horizon » ne désignait aucun champ : c'était un intitulé de groupe, elle est traitée comme telle.
- Tous les champs de saisie portent un **nom**, ce que recommandent les audits (remplissage automatique, restauration de session).

## v9.6.2 — 19/08/2026
- **Étiquettes intégrées au diagramme de flux.** Elles s'affichaient dans un bandeau sous le diagramme, alors que leur place était *dans* le diagramme. Chaque catégorie se prolonge maintenant vers les sujets qu'elle finance — Charges fixes → `#loyer` et `#energie`, Transport → `#voiture` — en réutilisant le mécanisme qui décompose déjà les investissements par compte. Une étiquette portée par plusieurs catégories apparaît sous chacune, avec la part qui en vient : `#voiture` peut ainsi recevoir une part du transport et une autre des dépenses libres, ce qui montre d'où sort réellement l'argent. Quatre étiquettes au maximum par catégorie, pour rester lisible.

## v9.6.1 — 19/08/2026
- **Champs de hauteur inégale.** Dans une grille, le champ de date gardait la hauteur imposée par le système et dépassait ses voisins. Tous les champs d'une grille partagent maintenant une hauteur fixe de 44 px, et le champ de date perd son habillage natif pour s'aligner sur les autres.
- **Boutons flottants superposés.** La règle du bouton « retour en haut » était déclarée **deux fois** : la seconde, plus loin dans la feuille, annulait le repositionnement fait lors du lot 2. Une seule règle subsiste, avec 12 px d'écart garanti entre les deux boutons.
- **Espace vide au-dessus de la barre de mois.** Elle se collait à une distance estimée du haut de l'écran, qui ne correspondait pas à la hauteur réelle de l'en-tête — variable selon l'appareil et l'état compact. Cette hauteur est désormais **mesurée** et exposée à la feuille de style, et le fond de la barre déborde latéralement pour masquer le contenu qui défile dessous.
- **Étiquettes dans le diagramme de flux.** Sous le diagramme, un bandeau liste ce que chaque étiquette (`#voiture`, `#chat`…) a coûté sur le mois, toutes catégories confondues, avec des barres proportionnelles. Il n'apparaît que si des étiquettes sont utilisées.

## v9.6.0 — lot 8 : finitions et accessibilité — 17/08/2026

### Écrans annexes
Le verrouillage, l'assistant de démarrage, le rappel de sauvegarde, la recherche et les bulles d'aide n'avaient pas encore été touchés : voiles d'arrière-plan **floutés** et assombris, panneaux à grand rayon avec ombre portée et **apparition animée**, écran de verrouillage doté d'un halo violet.

### Dernières couleurs héritées
Une douzaine de règles conservaient des teintes claires de l'ancienne identité (fonds crème, gris chauds, dorés) — invisibles ou illisibles sur fond sombre : puces de jour, jauges pleines ou dépassées, légende de fraîcheur des cours, boutons d'ajout, croix de suppression. Toutes passent aux jetons du thème.

### Accessibilité
- **Contour de focus visible** au clavier sur tous les éléments interactifs, avec un décalage suffisant pour rester lisible.
- **Cibles tactiles d'au moins 40 px** pour les boutons et les listes déroulantes, 34 px pour les éléments secondaires.
- **Lien d'évitement** « Aller au contenu », visible uniquement à la tabulation.
- **Repères ARIA** sur la navigation et le contenu principal.
- **Mode contraste élevé** : quand le système le demande, les filets et le texte secondaire s'éclaircissent et les bordures s'épaississent.
- **Un libellé pour chaque bouton et chaque champ** : les sept derniers champs sans intitulé accessible (référence d'estimation, enveloppe quotidienne, sélecteurs de fichier…) en reçoivent un.

**149 tests** couvrent désormais l'application, calculs et interface confondus.

## v9.5.0 — lots 6 et 7 : Achat-Vente et Réglages — 17/08/2026

### Achat-Vente : un formulaire qui pose des questions
Le formulaire alignait ses champs sans hiérarchie. Il se déroule maintenant en **trois étapes numérotées**, chacune introduite par une question : « Quel sens ? » (deux gros boutons *J'achète* / *Je vends*), « Sur quel compte, et quelle ligne ? », « Combien, et quand ? ». Les champs sont étiquetés et portent leur unité.

Le **journal devient un flux temporel** : les opérations sont regroupées par mois, chaque groupe affichant son solde net, et reliées par un fil vertical ponctué de pastilles directionnelles — corail avec flèche descendante pour un achat, menthe avec flèche montante pour une vente. On lit son activité par période plutôt que ligne à ligne.

### Réglages : cinq sections au lieu de quatorze cartes
L'ordre était historique : Apparence et Verrouillage arrivaient avant les paramètres du budget, la Zone sensible se perdait au milieu. Les cartes sont regroupées sous cinq intertitres — **Mon budget** (paramètres, poches, budgets par poste), **Mon patrimoine** (comptes, projets et emprunts), **Confort et sécurité** (apparence, verrouillage, profils), **Mes données** (sauvegarde, compte rendu, analyse IA, raccourci), **À propos** (journal des versions, zone sensible).

### Le redesign est complet
Les sept écrans du plan sont traités : fondations, Accueil, navigation et en-tête, Mois, Épargne, Investissements, Achat-Vente et Réglages. **140 tests** couvrent l'ensemble, sans régression sur les calculs.

## v9.4.0 — lot 5 : page Investissements — 17/08/2026

### Positions en cartes
Un tableau à huit colonnes sur un écran de téléphone impose un défilement horizontal et rend la lecture pénible. Chaque position devient une **carte** : catégorie et intitulé en tête, **valeur et performance mises en avant** juste dessous, puis quantité, prix de revient, cours et identifiant en champs étiquetés. Le code couleur de fraîcheur des cours (ambre à revoir, menthe saisi à la main, gris pour les prix manuels) s'applique désormais au champ entier. Sur grand écran, les champs se répartissent sur quatre colonnes. Un pied de carte récapitule le nombre de lignes, la valeur totale et la performance.

### Palette des graphiques
Les catégories reprennent les couleurs de la charte — **violet** pour les actions, **bleu** pour les ETF, **ambre** pour les métaux, **violet clair** pour le private equity, **ardoise** pour les obligations, **orange** pour les cryptos — avec des pastilles à fond sourd, lisibles sur les deux thèmes. Courbes d'évolution, diagramme de flux, camemberts et faisceau de projection suivent la même palette.

### Nettoyage
Les dernières couleurs de l'ancienne identité (laiton `#B08D3E`, encre `#1E2430`, vert `#2E7D5B`…) ont été remplacées partout, y compris dans la couleur de barre d'état du navigateur.

## v9.3.0 — lot 4 : page Épargne — 17/08/2026

### Comptes en anneaux
Chaque compte s'ouvre sur un **anneau de progression** vers son plafond, avec le pourcentage en son centre — plus lisible qu'une barre, et il laisse la place au solde en gros à côté. L'anneau passe au vert quand le plafond est atteint, et le message explique alors que les versements partent vers le compte de repli. En dessous : la place restante avant le plafond et les **intérêts annuels estimés** au taux saisi. Un compte sans plafond affiche un symbole d'infini plutôt qu'un anneau vide.

### Transfert
Les blocs source et destination portent un **liseré coloré** (corail pour ce qui part, menthe pour ce qui arrive) au lieu d'une bordure épaisse, la flèche centrale respire doucement pour marquer le sens, et le bouton d'inversion **pivote** quand on l'active. L'aperçu des soldes avant/après reprend les fonds sourds de la charte.

### Harmonisation
Les indicateurs des pages Épargne, Investissements et Achat-Vente adoptent le composant **tuile** introduit sur l'Accueil : même rayon, même ombre, même soulèvement au survol. Les cartes de ces pages reçoivent aussi leur famille de couleur.

## v9.2.0 — lot 3 : page Mois — 17/08/2026

### Accueil allégé
La carte « Dépense rapide » disparaît : le bouton flottant du lot 2 fait le même travail depuis n'importe quelle page, sans occuper d'espace permanent. L'Accueil se concentre sur ce qu'il doit montrer — le montant du jour, les quatre chiffres clés, les dividendes, les tendances, le patrimoine.

### Page Mois
- **Barre de mois collante** : elle reste visible pendant le défilement et rappelle en permanence le solde et le reste de fin de mois. Les flèches deviennent des boutons carrés à retour tactile, l'ajout de mois se réduit à un « ＋ ».
- **Bilan en six tuiles** (entrées, sorties, solde, reste d'enveloppe, reste de fin de mois, investi), colorées **selon le signe** plutôt qu'uniformément.
- **Code couleur par famille** : chaque carte de catégorie porte un liseré et un titre colorés selon sa nature — menthe pour les entrées, violet pour les charges fixes, bleu pour les abonnements, ambre pour la vie courante, cyan pour le transport, rose pour les vacances, menthe pour les investissements. Huit familles, appliquées à seize cartes : on repère une rubrique sans lire son titre.

## v9.1.0 — lot 2 : navigation et en-tête — 17/08/2026

### Saisie rapide accessible partout
Noter une dépense est le geste le plus fréquent : il ne devait plus imposer de revenir à l'Accueil. Un **bouton flottant** ouvre désormais, depuis n'importe quelle page, une **feuille qui monte depuis le bas** — intitulé, montant, destination (avec sous-menu pour les vacances), puces de suggestion des libellés fréquents. Validation à la touche Entrée, fermeture par Échap, en dehors de la feuille ou par le bouton Annuler. Le raccourci clavier **n** l'ouvre également.

### En-tête
Marque compacte sur deux lignes (nom + version discrète), **recherche transformée en bouton libellé** plutôt qu'en simple loupe — et réduite à une icône sur les petits écrans. L'indicateur d'enregistrement, qui occupait un tiers de la barre, se résume à **un point coloré et deux mots** : vert quand la sauvegarde vient d'aboutir, corail en cas d'erreur, neutre au repos.

### Navigation
**Indicateur lumineux** sous l'onglet actif, icône qui se soulève légèrement, barre translucide avec flou d'arrière-plan. Le bouton de retour en haut se décale pour ne pas gêner le bouton de saisie.

## v9.0.1 — correctifs du lot 1 — 17/08/2026
- **Feuille de style réparée.** En adaptant le compte rendu à la nouvelle palette, l'accolade fermante de sa règle avait disparu : le navigateur avalait alors **toutes les règles suivantes**. D'où les panneaux (bienvenue, verrou, rappel de sauvegarde) affichés en clair au milieu de la page, les grilles éclatées et les champs sans style. Un **contrôle de validité du CSS** — accolades équilibrées, règles bien formées, propriétés orphelines — rejoint la procédure de vérification : cette classe d'erreur ne peut plus passer.
- **Champs de saisie intégrés à l'interface.** Ils gardaient l'apparence par défaut du navigateur : angles droits, fond blanc, bordure grise. Un traitement unique s'applique désormais partout — coins arrondis, fond légèrement en retrait de la carte, **anneau violet au focus**, flèche dessinée sur les listes déroulantes. Les cellules des listes restent discrètes (transparentes au repos, mises en évidence à la saisie) : ce sont des cellules de tableau, pas des formulaires.
- **Assistant de bienvenue** : il s'ouvrait dès que la configuration n'avait pas été validée, même avec des données présentes. Il ne s'affiche plus si un mois, un compte ou une position contient quoi que ce soit.

## v9.0.0 — lot 1 : fondations, Accueil, compte rendu — 16/08/2026

Première étape du redesign complet, orientation **« Néo »** (sombre, contrasté, énergique) avec les micro-interactions du registre tableau de bord.

### Fondations
- **Système de jetons** : couleurs, espacements (4 → 32 px), rayons (10 → 26 px), ombres, durées et courbes d'animation sont définis une seule fois et pilotent toute la feuille de style.
- **Palette** : fond `#0F1117`, surfaces `#191C25`, **violet `#7C5CFF`** pour les actions, **corail `#FF6B5A`** pour les sorties, **menthe `#2FD9A0`** pour les entrées, **ambre** pour les alertes. Les anciens noms de variables restent des alias, ce qui évite de tout réécrire d'un coup.
- **Ménage des thèmes** : les quatre thèmes (clair, sombre, forêt, minuit) laissent place à **deux variantes du même thème** — sombre par défaut, clair en option, « automatique » suivant le réglage du téléphone. Quatorze blocs de règles devenus inutiles ont été supprimés.

### Composants
Cartes à grand rayon et ombre douce qui se soulèvent au survol, en-têtes cliquables, boutons principaux en dégradé violet avec halo, champs à focus violet, puces réactives, **navigation translucide** avec indicateur lumineux sous l'onglet actif, et un nouveau composant **tuile** pour les chiffres clés.

### Micro-interactions
Apparition en cascade des cartes à l'ouverture d'une page, glissement latéral entre onglets, **compteurs qui montent** au lieu d'apparaître brutalement, jauges qui se remplissent, impulsion lumineuse sur un élément qui vient de changer, squelettes pendant les calculs, en-tête qui se compacte au défilement. Tout est neutralisé si le système demande de réduire les animations.

### Accueil
Héro en dégradé violet avec le montant du jour **animé** et sa barre de progression, puis quatre tuiles porteuses de sens : solde du mois et reste de fin de mois en menthe ou corail selon le signe, épargne, investissements avec la plus-value en sous-titre.

### Compte rendu PDF
Palette alignée sur la direction artistique (titres violets, filets colorés, tuiles arrondies) tout en **conservant un fond blanc** : c'est un document destiné à l'impression.

## v8.3.0 — 16/08/2026
- **Tendances du mois enfin lisibles.** La courbe ne disait pas à quoi elle correspondait, et la suite de nombres qui la suivait était une énigme. Chaque **barre porte désormais le nom de son mois**, la barre dorée est le mois en cours (forcément incomplet) et une barre en pointillés montre la projection de fin de mois. Le détail mois par mois s'ouvre à la demande plutôt que d'encombrer la vue. Un **sélecteur 3 / 6 / 12 mois** permet de choisir la période de référence : 3 mois réagit vite, 12 mois lisse les variations saisonnières.
- **Dividendes déplacés sur l'Accueil**, juste sous la dépense rapide — là où on les saisit naturellement, plutôt qu'au milieu de la page Investissements. La carte est repensée : **résumé annuel** (encaissé, nombre de versements et de sources, moyenne mensuelle, écart avec l'année précédente), **frise des douze mois** montrant la saisonnalité des encaissements, formulaire de saisie regroupé sur fond distinct, et **journal des derniers versements** indiquant pour chacun la date réelle et le mois de rattachement.

## v8.2.1 — 13/08/2026 — *revue de sécurité, correction et optimisation*

### Faille corrigée : injection de code par une sauvegarde
Les noms de comptes, de positions, de projets et leurs identifiants étaient insérés dans la page **sans échappement**. Saisis par soi-même, le risque est nul ; mais l'application permet d'**importer une sauvegarde**, et un fichier reçu d'un tiers pouvait contenir un nom de compte porteur de code, exécuté à l'ouverture. Toutes ces valeurs passent désormais par l'échappement HTML, y compris dans les listes déroulantes et les attributs. Vérifié avec une sauvegarde piégée : le code n'est plus exécuté.

### Bug corrigé : relevé de l'indice dupliqué sept fois
Le bloc qui relève la valeur de l'indice de référence avait été inséré **sept fois**, et — plus gênant — dans le gestionnaire de **suppression** d'une période au lieu de celui d'enregistrement, avec une variable qui n'y existait pas. Conséquence : sept requêtes réseau identiques et un relevé qui ne se faisait jamais au bon moment. Une seule copie subsiste, au bon endroit.

### Rendu six fois plus rapide
`rendreTout()` reconstruisait les **six pages** à chaque saisie, alors qu'une seule est visible — un demi-mégaoctet de HTML régénéré pour afficher une ligne de dépense. Seule la page active est désormais reconstruite ; les autres sont marquées obsolètes et régénérées à leur affichage. Mesure sur une vraie sauvegarde : **519 ms → 90 ms**, 3 279 → 834 éléments dans la page, et 178 → 68 calculs mensuels.

### Robustesse
Des garde-fous centralisés garantissent qu'une sauvegarde ancienne ou tronquée ne fait plus échouer le rendu. Huit cas limites vérifiés : absence d'historique, d'investissements, d'achats-ventes, de poches, collections nulles, mois vide, libellés piégés.

### Divers
- Trois bulles d'aide rédigées mais rattachées à aucun bouton (indice de référence, sauvegarde chiffrée, disponible à investir) sont désormais accessibles.
- Audit statique final : aucune fonction dupliquée ni morte, aucun identifiant orphelin, aucun conteneur laissé vide, aucun sélecteur CSS en double, aucun JavaScript égaré dans la feuille de style.

## v8.2.0 — 13/08/2026
- **Projets et emprunts : un seul bloc.** Deux cartes séparées demandaient de savoir à l'avance dans laquelle aller. Elles n'en font plus qu'une : on choisit la **nature** (achat immobilier à préparer, objectif d'épargne, prêt immobilier, auto/conso, étudiant, renouvelable, autre dette) et **les champs s'adaptent**. Un projet affiche prix, frais, taux et durée envisagés puis calcule l'emprunt nécessaire ; un emprunt en cours affiche capital, mensualité et date de départ puis calcule le capital restant. Chaque ligne porte un badge de couleur (vert pour ce qu'on prépare, rouge pour ce qu'on rembourse) et une jauge de progression.
- **Tendances du mois enrichies.** Le simple pourcentage laissait deviner l'ampleur réelle. Chaque poste affiche maintenant **deux barres comparatives** (consommé / attendu au même stade du mois), une **mini-courbe** des trois derniers mois pour voir si la hausse est ponctuelle ou installée, et la **projection de fin de mois** au rythme actuel. Le nombre de postes suivis passe de 4 à 12.
- **Modules retirés** : « Allocation cible » et « Secteurs et zones ». Le remplissage automatique du secteur et de la zone ne pouvait pas tenir compte de la **composition réelle des ETF** — un « MSCI World » est réparti sur des milliers de lignes dans tous les secteurs et tous les pays, information que les sources publiques gratuites n'exposent pas. Classer un tel produit sous une seule étiquette donnait une image fausse de la diversification. Mieux vaut pas d'information qu'une information trompeuse.
- **Alignement des formulaires** : les étiquettes ont désormais une hauteur uniforme (les libellés longs ne décalent plus les champs voisins), la grille passe à deux colonnes nettes sur mobile, et plusieurs intitulés ont été raccourcis.

## v8.1.0 — 13/08/2026
Corrections issues d'un retour d'usage sur la v8.0.

- **Secteurs et zones désormais automatiques.** Un bouton « 🔎 Compléter automatiquement » récupère le secteur d'activité et le pays de chaque valeur auprès des données publiques, et les traduit (Utilities → Services publics, United States → Amérique du Nord). Les **ETF et matières premières ne publient pas ces champs** — ils sont diversifiés par nature : ils sont alors classés d'après leur intitulé (« MSCI World » → Monde, « Or physique » → Matériaux). Tout reste modifiable à la main.
- **Dividendes : net ou brut enfin explicite.** La case à cocher ne disait pas ce qu'elle cochait. Deux boutons la remplacent : **« 💶 J'ai reçu ce montant »** ou **« 🧾 Montant avant prélèvements »**. Le champ de prélèvements n'apparaît que dans le second cas, et l'aperçu précise « X crédités sur ton compte » ou « X annoncés par l'émetteur − 30 % = Y réellement crédités ».
- **Indice de référence : comparaison immédiate.** Il fallait attendre plusieurs enregistrements mensuels pour voir quoi que ce soit. Un bouton **« 📥 Récupérer l'historique de l'indice »** rapatrie les cours mensuels sur cinq ans et complète d'un coup tous les relevés déjà enregistrés. Le texte indique désormais explicitement de quelle carte proviennent les relevés (« 📝 Enregistrer le mois dans l'historique »).
- **Correctif : carte « Emprunts et dettes » en double** dans les Réglages, avec des identifiants dupliqués — le second exemplaire est supprimé.
- **Allocation cible : un vrai diagnostic.** Le tableau de pourcentages laissait l'interprétation au lecteur. Un encadré en français la fait : « Tu es surexposé à une catégorie de N € (X % au lieu de Y %). Il te manque M € sur telle et telle ligne. À ton rythme d'épargne, quelques mois de versements dirigés vers elles suffisent — sans rien vendre. » S'y ajoutent des remarques de bon sens : concentration excessive sur une ligne, part de cryptos élevée.

## v8.0.0 — 13/08/2026 — *patrimoine net, pilotage du portefeuille et sécurité*

Fonctionnalités inspirées d'une étude des applications de référence (Firefly III, Actual Budget, Ghostfolio, Wealthfolio, Portfolio Performance, YNAB), adaptées au fonctionnement hors-ligne et sans serveur de l'application.

### Emprunts et patrimoine net
Le patrimoine affiché était **brut** : un prêt immobilier n'y figurait pas. On enregistre désormais ses emprunts (capital, taux, mensualité, date de départ) et le **capital restant dû est recalculé chaque mois par amortissement**, avec le nombre de mensualités restantes et la date de fin estimée. Un capital relevé sur un extrait bancaire peut prendre le pas sur le calcul. L'Accueil affiche le **patrimoine net**, le brut et le détail des dettes.

### Allocation cible et rééquilibrage
Une part souhaitée par catégorie, et l'application mesure la **dérive** puis propose une **répartition du prochain versement** pour s'en rapprocher. Le rééquilibrage se fait **par les apports**, jamais par des ventes — vendre déclencherait l'imposition des plus-values. Les cibles sont normalisées à 100 % si leur somme diffère, et **rien n'est appliqué automatiquement** : ce sont des suggestions.

### Répartition sectorielle et géographique
Deux colonnes (secteur, zone) sur chaque position, avec listes de suggestions, et une carte qui affiche les deux répartitions en barres. Un **indicateur de concentration** signale le poids de la plus grosse ligne et des cinq premières.

### Comparaison à un indice
Choix d'un indice de référence (MSCI World, S&P 500, CAC 40, Euro Stoxx 50…) dont la valeur est **relevée automatiquement à chaque enregistrement mensuel**. La carte Performance compare alors ton TWR à celui de l'indice sur la même période, écart annualisé à l'appui.

### Indépendance financière
Capital nécessaire = dépenses annuelles ÷ taux de retrait (4 % par défaut, modifiable), dépenses pré-remplies depuis les six derniers mois. L'application estime la **durée pour l'atteindre** au rythme d'épargne actuel, puis **combien de temps le capital tiendrait** avec des retraits indexés sur l'inflation.

### Sauvegarde chiffrée
Nouveau bouton d'export protégé par mot de passe : **AES-GCM 256 bits**, clé dérivée par **PBKDF2 (210 000 itérations, recommandation OWASP)**, via les fonctions cryptographiques du navigateur — aucune bibliothèque externe. Le format est détecté à l'import, qui demande alors le mot de passe. Celui-ci n'est stocké nulle part : perdu, le fichier est définitivement illisible.

### Correctif important
Quatre cartes des Réglages — **emprunts, budgets par poste, profils, apparence (densité, devise, dossier IA, raccourci)** — étaient présentes dans la page mais **jamais remplies par le code** : elles s'affichaient vides. Les vérifications portaient sur les éléments appelés par le script, pas sur les conteneurs déclarés dans la page et laissés à l'abandon. Un contrôle **« tout conteneur vide doit être peuplé »** est ajouté à la procédure, en plus du parcours interactif complet dans un navigateur simulé.

## v7.6.0 — 13/08/2026
### Dividendes perçus
Nouvelle carte sur la page Investissements, avec quatre champs étiquetés :
- **Source** — société ou ETF, avec suggestion automatique des positions du portefeuille et des sources déjà utilisées ;
- **Date de perception** — le jour même par défaut, modifiable ;
- **Montant perçu** ;
- **Brut ou net** — une case à cocher ; si le montant est brut, un champ de prélèvements apparaît (30 % par défaut : 12,8 % d'impôt et 17,2 % de prélèvements sociaux, taux modifiable).

**Décalage automatique d'un mois** : un dividende perçu en juillet est comptabilisé dans les entrées d'**août**, comme sur un relevé bancaire — la convention que tu appliquais déjà à la main. Le libellé reprend le format habituel (« Dividende une société (05/08/2026) »), et un aperçu annonce le mois de rattachement avant validation.

Quand le montant est saisi en brut, c'est le **net réellement encaissé** qui entre au budget (le brut fausserait le solde), le montant brut et le taux appliqué restant enregistrés sur la ligne. Le journal des derniers versements et le **cumul annuel, net et brut**, s'affichent sous le formulaire — utile au moment de la déclaration de revenus.

Le journal est reconstruit à partir des mois plutôt que stocké séparément : il ne peut donc jamais se désynchroniser des entrées, et supprimer un dividende retire bien la ligne du budget.

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
- Parcours complet rejoué sur une sauvegarde réelle : migration d'une sauvegarde antérieure à la v6, soldes, cash PEA/PER, transferts, recherche, dossier IA et projection 30 ans — 24 vérifications, dont le solde exact d'un livret.

## v7.1.0 — 01/08/2026
### Corrections
- **Le bouton « Transférer » ne faisait rien** : le gestionnaire avait été placé dans la délégation des *modifications de champ* au lieu de celle des *clics* — un bouton n'émet pas d'événement de modification. Le transfert et ses raccourcis fonctionnent désormais.
- **Transfert vers le compte courant** : l'opération alimente maintenant les **remboursements du mois en cours** (montant positif, l'argent entre dans le budget) ; dans l'autre sens, du courant vers l'épargne, la ligne est négative.
- **Projection sur 30 ans** : le tableau s'arrêtait à 20 ans faute de jalons au-delà. Les échéances 25 et 30 ans sont ajoutées.
- **Plans compte-titres** : les cinq listes (actions, ETF, métaux, crypto, private equity) sont désormais imbriquées dans la carte « Détail du compte-titres », qui portait son total sans rien contenir — l'ensemble se replie d'un seul geste.
- **Dépense rapide** : le menu déroulant de suggestions natif est retiré. Il masquait l'écran, proposait pêle-mêle des libellés à usage unique, et faisait double emploi avec les puces.

### Raccourci iOS / Android
Ouvrir l'application avec une adresse du type `?ajout=Boulangerie&montant=6` enregistre la dépense dans le mois en cours et l'annonce à l'écran, sans navigation. Sur iPhone, l'app **Raccourcis** permet d'en faire un bouton d'écran d'accueil ou une commande Siri ; le paramètre `&cat=` choisit la catégorie (transport, entrees, vacAlim…). L'adresse est nettoyée après enregistrement, donc recharger la page ne crée pas de doublon. Le mode d'emploi et le modèle d'adresse figurent dans Réglages → 📱.

## v7.0.0 — 01/08/2026 — *performance, transferts et recherche*

### Cours de bourse : 7 à 8 fois plus rapides
Trois causes de lenteur cumulées, toutes corrigées : les positions étaient traitées **une par une** (désormais par lots de 6 en parallèle), l'appel direct à Yahoo — systématiquement bloqué par CORS depuis GitHub Pages — était **retenté pour chaque ligne** (le relais qui fonctionne est maintenant mémorisé pour la session), et une pause de 120 ms séparait chaque position (supprimée, la limitation du parallélisme suffit). Le taux de change n'est demandé qu'une fois par devise même en parallèle. Mesure sur un cas de plusieurs dizaines de positions : **13,7 s → 1,8 s**, et 68 requêtes inutiles économisées. Le temps écoulé s'affiche dans le message final.

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
- **Nouveau poste « Vacances · Remboursements reçus »** (montants positifs, ex. la part d'un tiers sur un hébergement) : il vient en déduction du total vacances partout — page Mois (carte dédiée), bilan, diagramme des flux, compte rendu PDF. Les sauvegardes existantes reçoivent le poste automatiquement à l'import, sans changement d'aucun chiffre (vérifié sur tes données réelles : reste fin de mois le montant de référence inchangé).

## v5.4.0 — 22/07/2026
- **Dépense rapide avec destination** : un menu déroulant sous la barre de saisie choisit où va la ligne — 🛒 Dépenses libres (défaut), 🚗 Transport, 🏖️ Vacances, 🏠 Charge fixe, 📱 Abo obligatoire, 🎮 Abo loisir, 💳 Échelonné, 💵 Entrée d'argent ou 🔁 Remboursement. Le signe suit la nature de la destination (« 12 » devient −12 € en dépense, +12 € en entrée), les catégories récurrentes se propagent aux mois suivants avec le toast « ↪ n mois », et taper une puce ramène la destination sur Dépenses libres.
- **Poches préconfigurées** : dans Réglages → 🪙, les raccourcis **＋ 📈 PEA**, **＋ 🛡️ PER** et **＋ 🎯 Projet** ajoutent une poche d'un tap — en mode part égale (1/3 → 1/4 automatiquement), insérée avant la poche « reste », en destination « suivi » dont le cumul apparaît sur la page Livrets. Doublons refusés, historique figé, effet à partir du mois prochain ; mode et destination restent modifiables ensuite.

## v5.3.0 — 22/07/2026
- **Revue de code** : suppression des fonctions et constantes mortes accumulées au fil des versions (`normaliserCotation`, `finDuMois`, `periodeDepuisCle`, `THEMES_SOMBRES`), et l'enrichissement de l'historique n'est plus exécuté deux fois à chaque démarrage.
- **Performance** : la simulation de projection (600 trajectoires Monte-Carlo) est désormais mise en cache et invalidée avec les autres calculs — la page Investissements ne la recalculait pas moins de… à chaque frappe dans une position.
- **Protection des données** : une ligne dont le libellé contient une date (« Dividende TotalEnergie (02/07/2026) ») n'est plus propagée aux mois suivants par le mécanisme des récurrents — un dividende daté est ponctuel par nature. Les lignes normales (« Loyer ») se propagent comme avant.
- **Validé sur données réelles** : la suite de tests (313) rejoue une sauvegarde réelle et vérifie que le moteur reproduit exactement les chiffres affichés sur le téléphone (reste de fin de mois le montant de référence).

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
- **Saisie uniformisée partout** : chaque carte de liste (charges fixes, abonnements, transport, dépenses libres, vacances, plans du compte-titres, mouvements de livret…) dispose de la même barre rapide « intitulé + montant + ＋ ». Signe automatique selon la nature de la carte, touche Entrée pour passer au montant puis valider, focus rendu à l'intitulé pour enchaîner, et propagation aux mois suivants pour les catégories récurrentes.
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
- **Mise à jour des cours à la demande** : chaque position (compte-titres, PEA, PER) a une colonne 🔗 où saisir une fois son **ISIN** (ex. FR0000120271) ou son **ticker Yahoo** (ex. TTE.PA, BTC-EUR). Le bouton « 🔄 Mettre à jour les cours » (page Investissements) résout les ISIN vers le bon symbole (priorité aux places européennes en euros), récupère les derniers prix, convertit les cotations USD en euros, affiche la progression, mémorise le symbole résolu et signale les échecs. Connexion internet requise **uniquement à l'appui du bouton** — pensé pour un usage mensuel ; aucune donnée du portefeuille n'est transmise, seuls les symboles sont interrogés (cotations publiques Yahoo Finance, avec relais de secours).

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
- **Propagation automatique des dépenses récurrentes** (charges fixes, abonnements obligatoires et loisirs, plans du compte-titres, montants PEA/PER) : un ajout apparaît dans tous les mois suivants, une modification ou suppression n'est répercutée que sur les mois à venir — l'historique réel n'est jamais réécrit.
- **Aucune donnée personnelle dans le dépôt** : l'application démarre vierge ; les données se chargent une fois par appareil via une sauvegarde JSON conservée hors de GitHub.
- **Étalement des paiements échelonnés** : total ÷ nombre de mois arrondi au centime, la dernière mensualité récupère le reste des arrondis (ex. 10 € / 3 mois → 3,33 · 3,33 · 3,34), mois manquants créés automatiquement.

## v4.2.0 — 18/07/2026
- **Compte rendu imprimable / PDF** : une page A4 par mois (bilan, camembert des dépenses par catégorie, répartition d'épargne, entrées, plus grosses dépenses, investissements), badge Réel / Prévisionnel.

## v4.1.0 — 18/07/2026
- **Nouvelle icône** : logo personnalisé (bouclier, courbe de croissance, pièces et maison), zone sûre « maskable » respectée.

## v4.0.0 — 18/07/2026
- **Version initiale** : reprise fidèle du classeur Excel « Mon Budget Personnel » — budget mensuel (enveloppe quotidienne paramétrable, report Reste Mois-1, répartition du Non Attribué en tiers arrondis au supérieur), livrets A/LDDS avec cumuls, investissements (positions TR/PEA/PERin, performance, historique et graphique), achat-vente, estimation de dépense par jour.
- **PWA 100 % hors-ligne** (IndexedDB), installable sur mobile, import de classeur .xlsx, sauvegarde et restauration JSON, montants acceptant les expressions (« -8*4 »).
