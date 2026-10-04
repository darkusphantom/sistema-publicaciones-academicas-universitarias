---
name: project-context
description: Contexto obligatorio del proyecto Red FaCyT. Cargar SIEMPRE al inicio de cualquier tarea, antes de leer o escribir código, para conocer la arquitectura (frontend-structure.md, inmutable), el estado real de implementación (progress.md, dinámico), el formato de diseño (docs/design/*), las reglas de seguridad (AGENTS.md §6 y docs/security/crown-jewels.md) y las reglas de documentación post-implementación. Use cuando vayas a implementar, revisar, testear, diseñar, desplegar o gestionar el tablero del proyecto.
---

# Contexto de proyecto — Red FaCyT

Fuente única de contexto de Red FaCyT. **Cárgala como primer paso de toda tarea** y lee los documentos obligatorios de tu rol antes de actuar. Esta skill centraliza el estado del arte del proyecto; si cambia, se actualiza aquí y todos los agentes se benefician sin tocar sus prompts.

## 1. Regla de lectura (SIN EXCEPCIONES)

Antes de **implementar, revisar, testear, diseñar, desplegar o actualizar el tablero**, lee los documentos del proyecto. No improvises sobre arquitectura, diseño o estado: léelos primero.

| Rol | Lectura obligatoria |
| --- | --- |
| **Todos los agentes** | `AGENTS.md` (guía maestra y reglas), `docs/architecture/frontend-structure.md` (arquitectura), `docs/architecture/progress.md` (estado real) y `docs/security/crown-jewels.md` (joyas de la corona) |
| developer | + `docs/design/brief.md`, `docs/design/components.md`, `docs/design/wireframes.md`, `docs/design/accessibility.md`, `docs/implementation/implementation_base.md`, `docs/trello/board.json`, `README.md` |
| designer | + `docs/design/*` (su propia salida) y `docs/architecture/progress.md` (no rediseñar lo implementado) |
| qa-reviewer | + `docs/design/*` (formato de diseño a validar), `docs/architecture/progress.md` (estado declarado) |
| tester | + `docs/design/*`, `docs/architecture/progress.md`, `docs/tests/` (evidencia previa) |
| security-reviewer | + `AGENTS.md`, `docs/architecture/frontend-structure.md`, `docs/architecture/progress.md`, `docs/security/crown-jewels.md` |
| security-architect | + `AGENTS.md`, `docs/architecture/frontend-structure.md`, `docs/architecture/progress.md`, `docs/security/crown-jewels.md`, `docs/Proyecto1_Junio2026.md`, `docs/implementation/implementation_base.md`, `docs/design/*` |
| blue-team | + `AGENTS.md`, `docs/architecture/frontend-structure.md`, `docs/architecture/progress.md`, `docs/security/crown-jewels.md`, `docs/implementation/implementation_base.md` |
| red-team | + `AGENTS.md`, `docs/architecture/frontend-structure.md`, `docs/architecture/progress.md`, `docs/security/crown-jewels.md`, `docs/Proyecto1_Junio2026.md`, `docs/implementation/implementation_base.md`, `docs/security/` (hallazgos previos para retests) |
| devops | + `docs/architecture/frontend-structure.md`, `docs/architecture/progress.md`, `docs/deployment` (si existe) |
| product-manager | + `docs/trello/board.json` y `docs/architecture/progress.md` |

## 2. División de archivos: inmutable vs. dinámico

- **`docs/architecture/frontend-structure.md` — ARQUITECTURA (casi inmutable).** Define la estructura objetivo y las convenciones. **Una vez implementado, NO se edita** como parte de una tarea de desarrollo. Solo cambia con aprobación explícita del usuario (refactor de arquitectura) y se registra en `progress.md`.
- **`docs/architecture/progress.md` — ESTADO (dinámico).** Se actualiza **siempre** tras cada implementación, corrección o prueba. Es el espejo fiel de qué está implementado y qué no.
- **`docs/design/*`** — especificación de diseño que el implementador debe seguir; se actualiza solo en fase de diseño.
- **`docs/tests/`** — evidencia de pruebas del tester.
- **`docs/security/*`** — seguridad: `crown-jewels.md` (activos críticos P0/P1/P2) y reportes/auditorías de `security-architect`, `blue-team` y `red-team`.

## 3. Regla de documentación post-implementación (OBLIGATORIA)

Al finalizar **cualquier** implementación o corrección:

1. **Actualizar `docs/architecture/progress.md`**: mover el ítem implementado a la sección "Implementado", añadir registro con fecha y, si aplica, nota de lo aún pendiente. Marcar la carpeta/archivos tocados.
2. Si se tocó el diseño, reflejarlo en `docs/design/*`.
3. Si se hicieron pruebas, el tester documenta en `docs/tests/`.
4. **Nunca** dejar el código implementado sin su contraparte documental: una implementación sin estado actualizado en `progress.md` se considera incompleta.
5. No comitear sin autorización expresa del usuario.

## 4. Pipeline y delegación

Las fases **NO se saltan ni se mezclan**:

```
diseño (designer / security-architect) → implementación (developer / blue-team) → revisión (qa-reviewer / security-reviewer) → testing (tester) → documentación (progress.md + docs/tests) → despliegue (devops)
```

- Si la tarea es de diseño → delega a `designer`; no reinventes la UI.
- Si la tarea es de seguridad/arquitectura → el `security-architect` define el modelo de amenaza y requisitos OWASP en fase de diseño.
- Si la tarea es de defensa/hardening o mitigar hallazgos → delega a `blue-team` (skill `seguridad`).
- Si la tarea es de auditoría/pentesting → delega a `red-team` (skill `pentesting`), que reporta por severidad sin modificar código.
- Si la tarea es de datos/backend → respeta los patrones de repositorio de `frontend-structure.md`.
- Si ya existe diseño en `docs/design/*`, el `developer` debe implementarlo tal cual; cualquier desviación se documenta y se justifica.
- Al finalizar, el `developer` reporta **qué quedó implementado y qué no**, para que `progress.md` y Trello reflejen la realidad.

## 5. Estado del proyecto (resumen actual)

Ver `docs/architecture/progress.md` para el detalle. Estado de alto nivel: fase frontend en curso (datos estáticos), arquitectura definida en `frontend-structure.md`, backend (PostgreSQL) pendiente.