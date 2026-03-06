# PROJECT_STRUCTURE.md

Propuesta de estructura final (inicialmente algunas carpetas pueden estar vacías, pero la organización es estable):

```
lumen-control-room/
├─ docs/
│  ├─ ARCHITECTURE.md
│  ├─ DATA_MODEL.md
│  ├─ AGENT_SYSTEM.md
│  ├─ ML_SYSTEM.md
│  ├─ PROJECT_STRUCTURE.md
│  └─ PRD.md (portado desde workspace raíz)
├─ public/
├─ src/
│  ├─ app/
│  │  ├─ (dashboard)/page.tsx            # Vista principal (control room)
│  │  ├─ api/                            # Endpoints / server actions
│  │  └─ layout.tsx, globals.css
│  ├─ components/
│  │  ├─ ui/                             # Botones, tarjetas, badges
│  │  └─ layout/                         # Shells, paneles, headers
│  ├─ features/
│  │  ├─ kanban/
│  │  │  ├─ components/
│  │  │  ├─ hooks/
│  │  │  └─ types.ts
│  │  ├─ leads/
│  │  │  ├─ pipeline-ui/
│  │  │  ├─ hooks/
│  │  │  └─ services/
│  │  ├─ prospecting/
│  │  │  ├─ jobs/
│  │  │  ├─ components/
│  │  │  └─ services/
│  │  ├─ agents/
│  │  │  ├─ orchestrator/
│  │  │  ├─ roster/
│  │  │  └─ hooks/
│  │  ├─ analytics/
│  │  └─ automations/
│  ├─ lib/
│  │  ├─ data/        # mocks, seeds
│  │  ├─ types/
│  │  ├─ supabase/
│  │  │  ├─ client.ts
│  │  │  └─ server.ts
│  │  └─ utils/
│  └─ styles/
├─ supabase/
│  ├─ migrations/
│  └─ seeds/
├─ ml/
│  ├─ notebooks/
│  ├─ pipelines/
│  └─ models/
├─ scripts/           # herramientas CLI para scraping, imports, etc.
└─ package.json, tsconfig.json, etc.
```

Notas:
- `docs/` vive dentro del repo para versionar las decisiones.
- `supabase/` alojará los SQL de migraciones y seeds.
- `ml/` permite que los experimentos convivan con el código principal.
- `scripts/` facilitará ejecutar scraping o jobs manuales mientras madura la capa de automatizaciones.

Esta estructura soporta trabajo paralelo por agente/feature sin colisiones y facilita CI/CD.
