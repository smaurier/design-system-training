// RoutineCard.stories.tsx — PAGE BLANCHE. ENDROIT 5 : le catalogue des états, en CSF3.
// L'oracle (test/RoutineCard.test.tsx) rend CHAQUE story exportée via `composeStories` et
// vérifie qu'elle correspond à l'état qu'elle prétend montrer — une story mal nommée ou mal
// configurée est un bug, pas un détail cosmétique.
//
// Exports attendus : `meta` (default export, `component: RoutineCard`, un `title`), et au
// moins quatre stories nommées : `Default` (status success, plusieurs tâches), `Vide`
// (status success, tasks: []), `Chargement` (status loading), `Erreur` (status error, avec
// message et onRetry).
export {};
