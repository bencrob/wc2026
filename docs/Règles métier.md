---
tags: [pronoscup, métier]
---

# Règles métier

Logique du tournoi, implémentée dans `src/app/domain/` (pur, testé). Voir [[Règles techniques]] pour le « comment ».

> 📐 **Référentiel détaillé et citable** : [Business Rules Guidelines](guidelines/07-business-rules.guidelines.md)
> formalise **chaque** règle métier (sections `01`…`10`, `Rule NN-MM`) au même format que les autres guidelines.
> Ce document-ci n'en est qu'un **résumé**.

## En bref
- **Format** : 48 équipes · 12 groupes A–L de 4 · 72 matchs de poule (M1–M72) + 32 en élimination directe (M73–M104) = **104 matchs**. → *Rule 01-xx*
- **Classement de poule** : victoire 3 / nul 1 / défaite 0 ; départage **points → diff. de buts → buts marqués → identifiant** (repli déterministe). → *Rule 02-xx*
- **Qualification** : 2 premiers par groupe (24) **+ 8 meilleurs 3es** (figés une fois les 12 groupes complets ; affectation par backtracking, 495 combinaisons valides). → *Rule 03-xx*
- **Tableau final** : bracket croisé fixe, propagation du vainqueur, perdants des demies → petite finale (M103) ; **champion** = vainqueur M104. → *Rule 04-xx*
- **Égalité KO** : tirs au but obligatoires (`winner`) sinon match non décidé et propagation bloquée ; interdit en poules. → *Rule 05-xx*
- **Résultats officiels & verrouillage** : fichier serveur, **alimenté automatiquement** (API football-data.org via GitHub Actions, ~2 h après le coup d'envoi) **ou à la main** (la saisie manuelle prime ; pas de scraping) ; effectif = officiel ?? prono ; lecture seule dès l'officiel **ou** le coup d'envoi passé. → *Rule 06-xx* · cf. [[Déploiement]]
- **Comparaison & points** : verdict `exact`/`bon résultat`/`raté` ; **3 pts** par score exact, **1 pt** par bon résultat ; prono affiché à côté de l'officiel. → *Rule 07-xx*
- **Import/export & validation** : schéma `{ version: 1, scores }`, ids M1–M104, scores entiers ≥ 0, `winner` interdit en poule / requis sur nul KO officiel. → *Rule 09-xx*
- **Persistance** : 2 sources de vérité (pronos persistés + officiels serveur), tout le reste `computed`. → *Rule 10-xx*

Voir aussi : [[Déploiement#Mettre à jour les résultats officiels]] · [[Règles techniques]].
