# Findings — avant de toucher à `ConfirmDialog.tsx`

À remplir AVANT d'ouvrir `src/ConfirmDialog.tsx`. Le correcteur lit ce fichier avant ton
code.

**Le rapport, tel quel :** *« En utilisant VoiceOver pour supprimer un post, la modale de
confirmation s'annonce juste "dialog, web dialog" — aucun titre, aucune idée de ce qui va
être supprimé. Le bouton pour fermer, lui, n'est annoncé que "bouton" — je ne sais pas ce
qu'il fait avant de l'activer. »*

1. **Radix `Dialog.Content` a besoin d'un descendant `Dialog.Title`** pour que la boîte de
   dialogue ait un nom accessible (`aria-labelledby` posé automatiquement). Le composant
   actuel a-t-il un `<h2>` visuel ? Utilise-t-il `Dialog.Title` pour l'afficher, ou un
   simple `<h2>` sans lien avec le dialogue ?

2. **Le bouton de fermeture** (le "×") — quel texte porte-t-il pour un lecteur d'écran ?
   Un caractère visuel ("×") est-il un nom accessible valable ?

3. Ces deux problèmes sont-ils détectables par un test automatisé (`jest-axe`) ou
   uniquement par un test manuel au clavier/lecteur d'écran ? Justifie.

4. Quelle est la correction minimale pour chacun ?
