# AMR Atlas — экспертная ревизия экранов с позиции клинической микробиологии

> Статус: **рабочий проект / prototype**. Документ задаёт целевую предметную структуру Atlas для Казахстана до подключения реальных surveillance-данных.

## 1. Общий принцип

Atlas не должен быть просто сайтом с картой резистентности. Целевая логика платформы:

```text
качество и охват данных
→ стандартизированный surveillance
→ organism × antimicrobial × specimen × population context
→ региональный анализ
→ сигналы
→ экспертная верификация
→ отчёты / публичная витрина
```

Ключевое правило: **никакой процент R, MDR или фенотип не существует сам по себе**. Минимальный контекст показателя:

- регион / организация / лаборатория;
- период;
- specimen;
- organism;
- antimicrobial;
- N tested;
- N resistant / S / I / R;
- breakpoint standard + version;
- deduplication profile;
- число лабораторий / охват;
- quality status;
- provenance / dataset version.

## 2. Целевые surveillance-профили

Atlas должен поддерживать несколько профилей анализа, а не один универсальный режим.

### 2.1 CAESAR / invasive surveillance

Назначение: национальная и международно сопоставимая оценка инвазивной AMR.

Приоритет:
- кровь;
- ликвор;
- первая подходящая запись пациента по organism в рамках утверждённого периода;
- только заданные organism × antimicrobial combinations;
- обязательное отображение N и качества данных.

### 2.2 GLASS routine surveillance

Расширенный surveillance клинических инфекций с specimen-specific логикой.

Приоритетные группы specimen:
- blood;
- urine;
- stool;
- cervical / urethral specimen.

### 2.3 Hospital antibiogram

Отдельный профиль для локальной клинической практики. Не смешивать с национальным CAESAR-показателем.

### 2.4 Research / exploratory dataset

Для исследовательских выборок, дополнительных specimen и нестандартных срезов. Всегда отделять от официального surveillance.

---

# 3. Ревизия существующих экранов

## 3.1 «Обзор»

### Оставить
- общую картину по Казахстану;
- карту;
- ключевые сигналы;
- динамику;
- явный статус источника данных;
- переключение периода / региона / organism.

### Убрать или изменить

**Убрать KPI «Средняя резистентность».** Он микробиологически неоднозначен: резистентность определяется для конкретной пары organism × antimicrobial.

**Не показывать единый KPI «MDR X%» без organism.** MDR должен иметь отдельное определение и organism context.

**Не использовать ESBL/CRE/MRSA в одном ряду как взаимозаменяемые сущности:**
- ESBL — phenotype/derived indicator;
- CRE — resistance phenotype;
- CPE/NDM/KPC/OXA-48-like — подтверждённый или предполагаемый mechanism/evidence layer;
- MRSA — phenotype/genetic target context.

### Целевые KPI Overview

1. **Изолятов в выбранном surveillance-профиле** — N.
2. **Лабораторий, передавших данные** — x / total active.
3. **Территорий с достаточным покрытием** — x / 20.
4. **Полнота обязательных полей** — %.
5. **Интерпретируемый AST** — %.
6. **Активные сигналы на верификации** — N.

Ниже отдельными cards:
- E. coli × 3GC R%;
- K. pneumoniae × carbapenem R%;
- S. aureus MRSA%;
- Acinetobacter spp. carbapenem R%;
- другие утверждённые priority indicators.

Каждая карточка обязана показывать N.

### Приоритет
**P0.**

---

## 3.2 «Микроорганизмы»

Текущий раздел смешивает полный taxonomic/reference catalogue и surveillance pathogens.

### Целевая структура

Переименовать пользовательский surveillance-раздел в **«Патогены»** или **«Приоритетные патогены»**.

В нём показывать не все 2381 WHONET organism codes, а только организмы, участвующие в выбранном surveillance profile.

Полный WHONET каталог оставить в отдельном разделе **«Справочник»**.

### Карточка pathogen

- scientific name;
- WHONET code;
- surveillance profile eligibility;
- specimen groups;
- N isolates;
- reporting laboratories;
- key organism × antimicrobial indicators;
- S/I/R distribution;
- trend;
- phenotype indicators;
- mechanisms **только с evidence level**;
- data quality;
- links to reference record.

### Недопустимо

Не использовать показатель вида «средний %R организма» без явно определённой marker pair/aggregation methodology.

### Приоритет
**P0-P1.**

---

## 3.3 «Антибиотики»

### Название

Для первой бактериальной версии предпочтительно **«Антибактериальные препараты»**.

Полный reference layer может называться **«Противомикробные препараты»**, если в дальнейшем добавляются antifungal и другие группы.

### Основная проблема текущего экрана

Нельзя показывать:

```text
Цефтриаксон — резистентность 28,6%
```

без organism context.

Правильно:

```text
E. coli × ceftriaxone
Blood
R 28.6%
N tested 14 382
EUCAST vXX
```

### Целевой экран препарата

- международное наименование;
- WHONET code;
- ATC / class;
- AWaRe group where applicable;
- organisms for which indicator is meaningful;
- organism-specific R% tables;
- specimen-specific breakdown;
- MIC/zone availability summary;
- breakpoint source/version;
- intrinsic resistance / expert-rule notes;
- related phenotype/mechanism markers;
- surveillance vs reference distinction.

### Приоритет
**P0.**

---

## 3.4 «Карта»

### Оставить
- 20 актуальных административных территорий;
- click/hover;
- region detail;
- selected indicator context;
- RU/KZ/EN names.

### Изменить

Карта не должна окрашивать территорию только по R% без качества оценки.

Минимальный region tooltip:

```text
область / город
organism × antimicrobial
R%
N tested
95% CI (production)
laboratories
coverage / completeness
period
quality status
```

### Семантика карты

- fill colour = R% / selected indicator;
- grey = no data;
- hatch / uncertainty marker = insufficient N;
- warning icon = QC issue;
- separate legend for quality/coverage;
- нельзя трактовать no data как low resistance.

### Навигационная роль

В конечном продукте **«Карта» лучше сделать представлением внутри «Регионы» или «Surveillance»**, а не самостоятельной предметной областью.

### Приоритет
**P0-P1.**

---

## 3.5 «Аналитика»

### Переосмыслить

Сейчас это общий research builder. Для production лучше превратить его в **«Surveillance Explorer»**.

### Первый выбор пользователя

1. Surveillance profile:
   - CAESAR invasive;
   - GLASS routine;
   - Hospital antibiogram;
   - Research.
2. Period.
3. Geography.
4. Organism.
5. Antimicrobial.
6. Specimen.
7. Care setting / patient origin where available.

### Вывод

- S / I / R;
- R% + 95% CI;
- N tested;
- trend;
- lab count;
- completeness;
- breakpoint version;
- deduplication profile;
- provenance.

### Приоритет
**P0-P1.**

---

## 3.6 «Сравнение»

### Оставить как инструмент, но убрать из верхнего уровня навигации в будущем

Сравнение — это **view mode**, а не отдельный предметный домен.

Оно должно открываться из:
- region page;
- pathogen page;
- surveillance explorer.

### Требования к валидному сравнению

Сравниваемые выборки должны иметь одинаковые:
- organism;
- antimicrobial;
- specimen definition;
- period semantics;
- breakpoint policy;
- deduplication profile.

Показывать:
- R%;
- N;
- 95% CI;
- lab coverage;
- data completeness;
- warning when representativeness differs.

Не делать leaderboard без статистического и quality context.

### Приоритет
**P1.**

---

## 3.7 «Сигналы / AMR Radar»

### Сильный раздел, оставить

Но сигнал должен иметь жизненный цикл.

### Статусы

```text
Detected
→ Under review
→ Data quality issue / Rejected
→ Epidemiological review
→ Confirmed analytical signal
→ Closed
```

### Типы сигналов

- resistance trend;
- phenotype;
- unusual organism;
- unusual organism × antimicrobial pattern;
- QC/data completeness;
- sudden laboratory reporting change;
- possible cluster;
- molecular mechanism (только при evidence).

### Обязательное содержимое

- current;
- baseline;
- delta;
- N;
- region;
- organism;
- antimicrobial/phenotype;
- algorithm version;
- dataset version;
- laboratories involved;
- reviewer;
- status;
- audit trail.

### Важно

AMR Radar **не должен называть сигнал вспышкой** без эпидемиологической верификации.

### Приоритет
**P1.**

---

## 3.8 «Данные и методы»

### Разделить на два

#### A. «Качество и охват»

Это должен стать полноценный operational раздел:
- active laboratories;
- reporting laboratories;
- regions covered;
- mandatory-field completeness;
- interpretable AST;
- duplicates;
- rejected records;
- EQA participation/status;
- EUCAST/CLSI distribution;
- last data submission;
- blood culture activity where available;
- QC issues.

#### B. «Методология»

- CAESAR profile;
- GLASS profile;
- deduplication;
- S/I/R interpretation;
- breakpoint versions;
- suppression thresholds;
- phenotype definitions;
- CI/statistics;
- source/provenance;
- release notes / methodology version.

### Для Казахстана

**Качество и охват должны быть одним из главных разделов**, а не приложением к analytics.

### Приоритет
**P0-P1.**

---

## 3.9 «Публикации»

### Переименовать в «Отчёты и публикации»

Содержимое:
- national annual AMR report;
- region reports;
- pathogen briefs;
- CAESAR/GLASS export status;
- methodology releases;
- downloadable CSV/XLSX/PDF when approved;
- scientific publications.

У каждой публикации:
- dataset version;
- reporting period;
- methodology version;
- publication status;
- review/approval information.

### Приоритет
**P1-P2.**

---

## 3.10 «Справочник»

### Оставить как отдельный reference domain

Это правильное место для полного WHONET-каталога.

Разделы:
- organisms;
- antimicrobials;
- specimen types;
- AST methods;
- mechanisms;
- phenotype definitions;
- breakpoint sources/versions;
- code mappings.

### Добавить governance metadata

- source;
- source version;
- reviewed_by;
- reviewed_at;
- content status: `source-derived / enriched / expert-reviewed`.

### Приоритет
**P1.**

---

## 3.11 «Механизмы AMR»

### Оставить, но строго отделить mechanism от phenotype

Для каждой записи:
- mechanism code;
- mechanism family;
- genes/examples;
- organism context;
- antimicrobial classes affected;
- phenotype markers;
- detection method;
- evidence level;
- interpretation limits;
- reference/source version.

### Evidence levels

Рекомендуемая модель:

```text
phenotypic suspicion
confirmatory phenotype
molecular PCR
sequencing / WGS
external confirmed source
```

Например, meropenem R не должен автоматически становиться NDM/OXA-48-like.

### Приоритет
**P0-P1.**

---

# 4. Новые разделы

## 4.1 «Surveillance» — новый основной раздел

Это должен стать предметным ядром платформы.

### Внутри

- CAESAR invasive;
- GLASS routine;
- hospital antibiogram;
- research/exploratory.

Каждый профиль задаёт собственные:
- pathogens;
- specimens;
- antimicrobial combinations;
- deduplication;
- reporting rules;
- QC rules.

**Приоритет: P0.**

---

## 4.2 «Качество и охват» — новый основной раздел

Сделать раньше сложного Radar/AI.

**Приоритет: P0.**

---

## 4.3 «Лабораторная сеть»

Позже, после реального подключения источников:
- laboratories;
- reporting status;
- methods;
- AST standards;
- EQA;
- coverage;
- data latency.

Public view должен уметь скрывать чувствительные details.

**Приоритет: P1-P2.**

---

## 4.4 «Потребление антибактериальных препаратов»

Отдельный domain, не смешивать с AST.

Целевая методология:
- ATC/DDD;
- DDD / 1000 inhabitants / day;
- DDD / 100 bed-days where available;
- AWaRe Access / Watch / Reserve;
- national / regional / facility trends;
- later correlation with resistance trends.

**Приоритет: P2.**

---

## 4.5 One Health

Архитектурно предусмотреть поле `surveillance_domain`:

```text
human
animal
food
environment
```

Первая версия Atlas = `human`.

Не добавлять пустой One Health UI до появления валидированных источников.

**Приоритет: P3.**

---

# 5. Рекомендуемая навигация v1

Для первой серьёзной версии:

1. **Обзор**
2. **Surveillance**
3. **Регионы**
4. **Патогены**
5. **Фенотипы AMR**
6. **Сигналы**
7. **Качество и охват**
8. **Справочник**
9. **Методология**
10. **Отчёты**

### Внутренние, а не верхнеуровневые режимы

- карта;
- аналитика;
- сравнение;
- таблица;
- тренд.

Они являются способами просмотра выбранного предметного контекста.

### Второй этап

- лабораторная сеть;
- antimicrobial consumption / AWaRe;
- One Health.

---

# 6. Первый набор priority organisms

Не использовать весь WHONET reference catalog как surveillance list.

Для стартового human bacterial surveillance предусмотреть отдельный конфиг приоритетных групп, ориентированный на CAESAR/GLASS и национальную методологию.

Минимально архитектура должна поддерживать:
- Escherichia coli;
- Klebsiella pneumoniae;
- Staphylococcus aureus;
- Streptococcus pneumoniae;
- Acinetobacter spp.;
- Pseudomonas aeruginosa where national/CAESAR profile requires;
- Enterococcus faecalis / Enterococcus faecium where profile requires;
- Salmonella spp.;
- Shigella spp. for GLASS context;
- Neisseria gonorrhoeae for GLASS context.

Точный production-набор хранить в **versioned surveillance profile**, а не hard-code в UI.

---

# 7. Phenotype / mechanism model

Нужны три разные сущности:

```text
AST result
→ derived phenotype
→ mechanism evidence
```

Примеры:

```text
meropenem R
→ carbapenem-resistant Enterobacterales phenotype
→ OXA-48-like confirmed by PCR
```

или

```text
cefoxitin/oxacillin phenotype
→ MRSA
→ mecA confirmed by molecular method
```

UI всегда должен показывать, на каком уровне evidence находится вывод.

---

# 8. Правила отображения малых выборок

До утверждения национальной методологии использовать configurable policy.

Prototype candidate:
- N < 10: percentage suppressed;
- 10 ≤ N < 30: visible with strong uncertainty warning;
- N ≥ 30: normal display;
- CI required for production comparisons.

Карта, rankings и signals должны применять ту же policy.

---

# 9. План внедрения

## P0 — следующий этап прототипа

1. Добавить верхнеуровневый domain **Surveillance**.
2. Добавить **Качество и охват**.
3. Убрать KPI «Средняя резистентность».
4. Убрать/переформулировать organism-less MDR.
5. Разделить surveillance pathogens и полный reference catalog.
6. Перестроить карточки антибактериальных препаратов на organism × antimicrobial.
7. Добавить surveillance profile selector.
8. Стандартизировать phenotype vs mechanism labels.
9. Исправить официальные display names территорий Казахстана без изменения стабильных internal identifiers.
10. Везде использовать одинаковый low-N policy.

## P1 — до пилота

1. Реальные laboratories / coverage model.
2. CAESAR deduplication profile.
3. GLASS profile.
4. Demographic / epidemiological context: age group, sex, care setting, origin.
5. Quality dashboard.
6. Signal workflow + audit trail.
7. 95% CI.
8. Reports/export with methodology version.
9. Expert review governance for reference content.

## P2 — после первых реальных datasets

1. Antimicrobial consumption / AWaRe / DDD.
2. Facility benchmarking where governance permits.
3. Historical breakpoint harmonization policy.
4. More advanced signal detection.
5. Population denominators and burden indicators where source data permit.

## P3 — расширение

1. One Health domains.
2. Molecular/WGS integration.
3. Separate TB drug-resistance module if required.
4. Forecasting only after validated longitudinal data and methodology.

---

# 10. Что не делать сейчас

Не добавлять ради визуального эффекта:
- прогноз AMR без реальной временной серии;
- AI risk score без валидированной модели;
- «национальный рейтинг лучших/худших регионов» без N/CI/coverage;
- mechanism labels, основанные только на resistance phenotype;
- One Health пустые экраны;
- TB в общую bacterial AMR таблицу;
- единый средний %R по разным препаратам;
- единый MDR% по разным организмам.

---

# 11. Критерий готовности первого пилота

Пилотная версия считается предметно готовой, когда для любого числа R% пользователь может ответить на вопросы:

1. Что за organism?
2. Что за antimicrobial?
3. Какой specimen?
4. Какая population / care setting?
5. Какой период?
6. Какое N?
7. Сколько лабораторий?
8. Какой breakpoint standard/version?
9. Какое правило дедупликации?
10. Каково качество/полнота данных?
11. Откуда взялся dataset?
12. Можно ли сравнивать этот показатель с другим?

Если хотя бы несколько ответов неизвестны, показатель не должен выглядеть как окончательная национальная статистика.
