# Honeymoon Planner — Contexte du projet

## Description
Application web pour organiser une lune de miel à Bali (21 août – 8 septembre 2025).
Conçue pour être réutilisable pour n'importe quel voyage.

## Stack technique
- **React 18 + TypeScript + Vite**
- **Tailwind CSS** — palette : coral (#C4715A), gold (#C9973F), cream (#FDF6EC), forest (#2D4A3E)
- **@hello-pangea/dnd** — drag & drop des activités
- **lucide-react** — icônes
- **date-fns** — gestion des dates (locale `fr`)
- **localStorage** — persistance des données

## Structure
```
src/
├── types/index.ts          — Tous les types TypeScript
├── data/initialData.ts     — Données complètes du voyage Bali
├── hooks/useTrip.ts        — State management + CRUD + budget
├── components/
│   ├── Header.tsx          — Hero + tabs (Planning / Budget / Alertes)
│   ├── Sidebar.tsx         — Timeline destinations + mini-budget
│   ├── DayCard.tsx         — Carte jour (activités DnD, restos, transports)
│   ├── BudgetDashboard.tsx — Donut chart SVG + tableaux
│   └── AlertsPanel.tsx     — Rappels avec statut cycling
└── App.tsx                 — Layout principal + DragDropContext
```

## Itinéraire Bali (données initiales)
| Destination   | Dates          | Hôtel               | Nuits |
|---------------|----------------|---------------------|-------|
| Ubud          | 21–24 août     | Komaneka at Bisma   | 3     |
| Nusa Penida   | 25–26 août     | Penida View Cottage | 2     |
| Îles Gili     | 27–29 août     | Gili Meno Huts      | 3     |
| Uluwatu       | 30 août–2 sept | Bulgari Resort      | 4     |
| Nusa Dua      | 3–8 sept       | Mulia Resort        | 5     |

## Lancer le projet
```bash
npm run dev   # http://localhost:5173
```

## Fonctionnalités implémentées
- ✅ Planning jour par jour (19 jours)
- ✅ CRUD activités, restaurants, transports
- ✅ Drag & drop pour réordonner les activités
- ✅ Budget dashboard (donut chart + détail par destination)
- ✅ Alertes / rappels avec priorité et statut
- ✅ Filtrage par destination
- ✅ Persistance localStorage
- ✅ Responsive + impression PDF

## À faire / idées futures
- [ ] Édition inline des éléments (actuellement : supprimer + recréer)
- [ ] Intégration Google Maps pour les trajets
- [ ] Export PDF avec jsPDF
- [ ] Drag & drop entre les jours
- [ ] Mode sombre
