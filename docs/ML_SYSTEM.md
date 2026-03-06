# ML_SYSTEM.md

## 1. Objetivo
Preparar el Agent Operating System para ejecutar modelos de Machine Learning que mejoren la prospección, scoring y outreach a partir de los datos capturados en Supabase.

## 2. Casos de Uso Iniciales
1. **Lead Scoring Model**: predecir probabilidad de conversión en base a industria, tamaño, stack, actividad online, historial de outreach y atribuciones de agentes.
2. **Outreach Optimization**: analizar rendimiento de mensajes/plantillas por canal para sugerir el mejor enfoque.
3. **Lead Discovery Similarity**: detectar empresas similares a clientes exitosos usando embeddings/características.

## 3. Pipeline de Datos
1. **Ingesta**: eventos (`lead_events`, `outreach_events`, `conversion_events`, `agent_events`) se escriben en Postgres.
2. **Transformación**: vistas materializadas o jobs ETL (Supabase Functions, dbt, SQL scripts) generan datasets limpios:
   - `ml_lead_scoring_dataset`
   - `ml_outreach_dataset`
   - `ml_similarity_dataset`
3. **Export**: tareas programadas exportan CSV/Parquet a storage (Supabase Storage o S3 compatible) para entrenamiento en Python.
4. **Entrenamiento**: scripts en `ml/` o notebooks (Jupyter) usando pandas + scikit-learn / xgboost / lightgbm.
5. **Registro de Modelos**: archivo `ml/models.json` con versión, métrica y ubicación del modelo.
6. **Inferencia**: workers (Python Edge Function o Container) cargan el modelo y escriben resultados en `lead_scores` o `outreach_recommendations`.

## 4. Arquitectura Técnica
```
Supabase (Postgres + storage)
   ↓ exports (SQL/Edge Functions)
Python ML workspace (ml/)
   ↓ models (.pkl/.onnx)
Workers / Edge Functions
   ↓
lead_scores / recommendations tablas
   ↓
Frontend (Next.js) consume scores y los muestra en Pipeline & Analytics
```

## 5. Datos y Features
- **Lead Scoring**: industria (one-hot), tamaño (ordinal), ubicación, stack (bag-of-tech), funding stage, hiring signals, score manual, tiempo en etapas, agente responsable, métricas de outreach (n° mensajes, tasa respuesta), xp acumulado.
- **Outreach Optimization**: canal, plantilla, longitud, CTA, tono, sector, respuesta (binary), tiempo de respuesta.
- **Similarity**: embeddings de descripciones, keywords de productos, features numéricos (ingresos estimados, tamaño equipo).

## 6. Modelos & Herramientas
- Iteración rápida con **Logistic Regression** / **Random Forest** / **Gradient Boosting** (sklearn, LightGBM, XGBoost).
- Para similitud, se pueden usar embeddings (OpenAI text-embedding-3, Cohere) almacenados en pgvector.
- Mantener notebooks versionados en `ml/notebooks/` y scripts en `ml/pipelines/`.

## 7. Deploy & Inferencia
- **Batch**: cron job diario/semanal recalcula scores para todos los leads.
- **On-demand**: cuando llega un lead nuevo, se dispara inferencia rápida para `score` inicial.
- **Serving**: Edge Function en Supabase (Deno) o microservicio en Fly/Render (Python FastAPI) que recibe payloads y responde con score.

## 8. Gobernanza & Métricas
- Guardar métricas de entrenamiento (`accuracy`, `precision`, `recall`, `PR-AUC`) en `ml/model_metrics`.
- Versionar modelos con `model_version` y guardar en cada `lead_scores` para trazabilidad.
- Monitorear drift (comparar distribución de features vs. entrenamiento).

## 9. Integración con UI
- `Leads Pipeline` muestra score + factores.
- `Analytics` ofrece gráficos de conversión por score y recomendaciones de outreach.
- `Agent Orchestrator` usa los scores para priorizar tareas (ej. leads >0.7 pasan antes).

Este documento sirve como blueprint para que, una vez tengamos suficientes datos, añadir ML sea plug-and-play sin rediseñar la arquitectura.
