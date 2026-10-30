# satisfactory-calculator

Калькулятор производственных цепочек Satisfactory.

- ручные процедуры — `docs/manuals/`;
- для AI-агента — `AGENTS.md`.

## Запуск

```bash
npm install
npm run data:catalog   # каталог игры из data/raw — нужен перед сборкой
npm run data:icons     # иконки с wiki.gg (по желанию, кешируются в data/icons)
npm run dev            # http://localhost:3000
npm test               # vitest
npm run build          # статический сайт в dist/
```

Код сайта — `src/` (движок расчёта — `src/engine/`), сборка каталога — `scripts/catalog/`, тесты — `tests/`.

## Лицензия

Код — [MIT](LICENSE). Данные игры в `data/raw/` и иконки предметов — собственность
Coffee Stain Studios; лицензия MIT на них не распространяется. Это фанатский проект,
не связанный с Coffee Stain Studios.
