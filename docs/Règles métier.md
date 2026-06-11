---
tags: [pronoscup, métier]
---

# Règles métier

Logique du tournoi. Implémentée dans `src/app/domain/` (pur, testé). Voir [[Règles techniques]] pour le « comment ».

## Format
- **48 équipes**, **12 groupes** A–L de 4. Tirage officiel (5 déc. 2025), **noms verrouillés** (corrigeables seulement via le code/import).
- Phase de groupes en **round-robin** : 6 matchs/groupe = **72 matchs** (M1–M72).
- Données figées par équipe : nom, drapeau, groupe, **classement FIFA** (dernier connu avant la CDM) → affiché à côté de l'équipe.

## Classement de groupe
Points **3 / 1 / 0** (victoire / nul / défaite). Départage, dans l'ordre :
1. points
2. différence de buts
3. buts marqués
4. **ordre alphabétique de l'identifiant** (départage déterministe de repli, à défaut de tirage au sort)

> Implémenté par une **stratégie** `RankingComparator` (cf. [[Règles techniques#SOLID]]).

## Qualification
- **2 premiers** de chaque groupe (24 équipes).
- **+ 8 meilleurs 3es** sur les 12 (même comparateur). Le classement des 3es n'est **figé que lorsque les 12 groupes sont complets**.
- **Affectation des 8 meilleurs 3es** aux 8 créneaux des 16es : créneaux éligibles fixes (table `THIRD_PLACE_SLOTS`), résolus par **backtracking** (un glouton échoue ; les **495** combinaisons possibles ont toutes une solution valide — invariant testé).

## Tableau final (élimination directe)
- 32 équipes : **16es (M73–88) → 8es (M89–96) → quarts (M97–100) → demies (M101–102) → petite finale (M103) → finale (M104)** = **104 matchs** au total.
- **Bracket croisé FIFA** : les liens (qui affronte qui au tour suivant) sont fixes (`BRACKET_LINKS`), un match n'est pas alimenté par les deux matchs adjacents.
- **Propagation** : le vainqueur d'un match avance au match suivant. Les **perdants des demies** vont en petite finale (M103).
- **Champion** = vainqueur M104 · **Finaliste** = perdant M104 · **3e** = vainqueur M103.

## Égalité en KO → tirs au but
- Un match à élimination **nul** doit être tranché : on **désigne le vainqueur aux tirs au but** (`winner` = `home`|`away`).
- Sans vainqueur désigné, le match est **non décidé** et la **propagation est bloquée** (état « à départager »).
- Interdit en phase de groupes (un nul y reste un nul).

## Résultats officiels & verrouillage
- Source = **fichier serveur** `public/official-results.json`, **saisi à la main** au fil des vrais matchs. ⚠️ **Aucune API/site officiel interrogé** — pas de scraping.
- **Priorité** : pour chaque match, score effectif = **officiel ?? pronostic**. L'officiel pilote classements + bracket.
- **Verrouillage** : un match avec résultat officiel est en **lecture seule** — la saisie utilisateur est ignorée (cf. [[Règles techniques#Verrouillage]]).
- **Comparaison pronostic** (jeu) : `exact` (score identique) · `bon résultat` (bon vainqueur/nul, score différent) · `raté`. Synthèse globale affichée.

## Pronostics & persistance
- Les **scores sont saisis par l'utilisateur** ; seuls les pronostics sont **persistés** (LocalStorage, par navigateur). Voir [[Règles techniques#Persistance]].
- Import/export JSON des pronostics. Le `reset` n'efface **que** les pronostics, pas les officiels.

Voir aussi : [[Déploiement#Mettre à jour les résultats officiels]].
