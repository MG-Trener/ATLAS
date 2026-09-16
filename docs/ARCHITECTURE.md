# AMR Atlas — архитектура перехода от прототипа к платформе

## Статус

AMR Atlas сейчас существует в двух представлениях:

1. **Standalone GitHub Pages** в корне репозитория — быстрый визуальный и UX-прототип.
2. **Next.js frontend** в `app/` — целевая production-кодовая база.

Это временная схема. Standalone не должен превращаться во второй независимый production frontend.

## Главный принцип

> Новая продуктовая логика сначала формализуется как общий контракт данных/состояния, затем реализуется в Next.js. Standalone может получать ускоренную визуальную реализацию, но не должен становиться единственным местом, где живёт бизнес-логика.

## Что уже общее по смыслу

- RU / KZ / EN;
- выбранный регион и аналитический контекст;
- разделение live reference-данных и demo surveillance-данных;
- 20 административных территорий Казахстана;
- справочники WHONET / AMRIE;
- AMR knowledge layer;
- единые понятия R, MDR, ESBL, CRE, MRSA и механизмов AMR.

## Целевая структура

```text
UI (Next.js)
  ↓
Application state / filters
  ↓
Data provider interface
  ├─ Reference provider → Supabase reference views
  ├─ Surveillance provider → validated aggregates
  └─ Demo provider → development only
  ↓
Ingestion / QC
  ├─ WHONET
  ├─ LIS/API
  └─ future supported sources
  ↓
PostgreSQL / Supabase
```

## Правила разработки с этого момента

1. **Demo и real data никогда не смешиваются без явной маркировки.**
2. У каждого аналитического показателя должен быть provenance: источник, период, N, правило расчёта, breakpoint standard/version и дата обновления.
3. Язык — глобальное состояние платформы, а не локальная настройка отдельной страницы.
4. Геометрия Казахстана хранится локально и версионируется; внешний источник используется только как аварийный fallback.
5. Публичные reference-данные read-only; surveillance raw data не доступны браузерному `anon`.
6. Новые страницы должны использовать общий набор базовых сущностей навигации: Обзор / Карта / Организмы / Препараты / Механизмы / Сигналы / Методология / Отчёты.
7. UI не определяет методологию расчёта. Методология задаётся отдельно и версионируется.
8. Перед переносом функции из prototype в production фиксируется её data contract.

## Роль трёх концепций

Три текущие концепции не должны остаться просто «скинами» одного пользователя.

### National AMR Atlas
Публичная национальная витрина. Основной сценарий — география, прозрачность данных, тренды, отчёты и методология.

### Clinical Workspace
Рабочее место авторизованного лабораторного/AMR-аналитика. Основной сценарий — фильтрация, верификация, QC, детальный анализ organism × antimicrobial × specimen × period.

### Intelligence Center
Режим регионального/национального мониторинга. Основной сценарий — сигналы, watchlist, приоритизация и расследование отклонений.

## План миграции

### Этап 1 — общие инварианты
- [x] единый статус Prototype / Demo Data;
- [x] единое языковое состояние между standalone и Next.js;
- [x] локальная геометрия 20 территорий;
- [x] автоматическая проверка public prototype + TypeScript + Next build;
- [ ] единый manifest версии платформы и источников данных;
- [ ] общий typed analysis context в Next.js.

### Этап 2 — data provider
- [ ] формальный TypeScript-интерфейс surveillance provider;
- [ ] demo-provider на этом интерфейсе;
- [ ] Supabase aggregate provider;
- [ ] provenance для каждого результата.

### Этап 3 — перенос UX
- [ ] National Atlas в Next.js;
- [ ] Clinical Workspace в Next.js;
- [ ] Intelligence Center в Next.js;
- [ ] reference/mechanisms как единые Next routes;
- [ ] standalone остаётся только до визуального паритета.

### Этап 4 — отключение второго frontend
После достижения паритета GitHub Pages публикуется из статического экспорта Next.js. Корневые standalone JS/HTML архивируются или удаляются.

## Definition of done для production-функции

Функция считается готовой к production, если:

- имеет RU/KZ/EN;
- работает с клавиатурой и имеет доступные labels;
- использует общий data contract;
- у данных указан provenance;
- demo-значения нельзя принять за официальные;
- проходит `npm run verify`;
- проходит production build;
- не требует внешнего runtime-ресурса, если его можно версионировать локально.
