# Projet : plateforme writeups + notes (remplace notes.khpte.fr)

Remplace intégralement l'ancien setup Quartz + portail PHP. Un seul système qui sert à la fois les notes privées (ex-vault Obsidian) et des writeups publics, avec un espace admin pour publier.

## Stack
- **Backend** : Node.js. Choisi pour la vélocité de dev et l'expérience déjà acquise ; à ce volume de trafic (site perso), la différence de perf brute avec Go serait invisible — pas de raison de payer le coût d'apprentissage.
- **Frontend** : HTML/CSS/JS vanilla, **aucun framework** (pas de React — pas maîtrisé). Structurer en partials réutilisables (header/footer/nav séparés) dès la V1 front, pour que ça se transpose quasi tel quel en templates serveur (EJS/Handlebars) une fois le backend attaqué.
- **Stockage** : SQLite dès le départ (users/sessions). Pas de service DB séparé — cohérent avec le pattern "un conteneur par service" du reste de l'infra.
- **Rendu markdown** : `markdown-it` + `gray-matter` (frontmatter) + `shiki` (coloration syntaxique). Parité visée avec ce que fait Quartz actuellement (footnotes, TOC, GFM). KaTeX en client-side (auto-render), pas de rendu LaTeX côté serveur.
- **Wikilinks Obsidian** (`[[note]]`) : preprocessing regex avant le parsing markdown, pas géré nativement par `markdown-it`.

## Contenu
- Fichiers markdown + frontmatter, champ `visibility: public | private`. `premium` est réservé pour plus tard dans le schéma mais **rien ne l'exploite pour l'instant** — pas de paiement dans cette phase.
- Sync inchangée : rsync/scp manuel depuis le PC perso (vault Obsidian) vers `content/` sur le VPS. Pas de watcher : cache par mtime, on ne reparse un fichier que si sa date de modif a changé.

## Auth
- Session cookie server-side, mot de passe hashé argon2 (même approche que Vaultwarden sur le VPS). Remplace le portail PHP `auth_request` actuel.
- Un seul compte admin pour le MVP. Pas d'inscription publique. La table users sert de socle pour une future gestion d'acheteurs, mais ça n'est pas construit maintenant.

## Hors scope (pour l'instant)
- Paiement / Stripe / achat de writeups premium
- Inscription publique
- Tout ce qui touche à la monétisation

## Direction visuelle (front)
- Identité cyber/tech en base (mono pour le chrome UI, dense, feel outil) + accents inspirés d'un personnage de marchand énigmatique : palette violet profond / aubergine + or/laiton vieilli, jamais vert-sur-noir façon terminal cliché. Ton un peu cryptique dans les micro-textes. Motif du masque utilisé avec parcimonie (favicon, loader), jamais en thème littéral.
- Prototypage en cours dans Claude Design — demander l'état actuel du brief si besoin d'ajuster.

## Phasage
1. **Front d'abord** : pages statiques HTML/CSS/JS — home, liste writeups, détail writeup (code + TOC), login, mockup admin (dépôt de writeup, non fonctionnel à ce stade)
2. **Backend ensuite** : routes Node, parsing markdown, auth, SQLite

## Workflow repo
- `main` protégé par ruleset (PR obligatoire, pas de bypass, force-push et deletions bloqués)
- Toujours passer par une branche + PR, jamais de push direct sur `main`
- `@claude` dans une issue ou une PR déclenche le workflow GitHub Actions installé

## Déploiement cible (pas encore fait)
- VPS OVH existant (voir conventions ci-dessous), le VPS ne sert **jamais** de bac à sable de dev
- Un service = un conteneur Docker dédié dans `/opt/<nom>/`, secrets en `.env`, vhost nginx en loopback + TLS certbot, utilisateur système dédié

## Conventions générales (héritées de l'infra existante)
- Jamais de secrets hardcodés
- Solutions minimalistes, sécurisées par défaut
- Ne jamais inventer une syntaxe/API — vérifier avant de proposer
