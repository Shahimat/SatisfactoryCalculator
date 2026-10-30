# Опубликовать сайт калькулятора на GitHub Pages

## Когда использовать
Первый запуск публикации или проверка сайта локально перед пушем в `master`.

## Шаги
1. Включить публикацию: GitHub → Settings → Pages → Source «GitHub Actions» (один раз на репозиторий). Pages на бесплатном тарифе работают только у публичного репозитория: приватный сначала сделать публичным (Settings → General → Change repository visibility) → проверка: `gh repo view --json visibility` → `PUBLIC`.
2. Адрес сайта — `https://<owner>.github.io/<имя репозитория>/`; переименовывать репозиторий не нужно: CI подставляет `PAGES_BASE` из имени репозитория → проверка: в `.github/workflows/pages.yml`, шаг Build site, `PAGES_BASE: /${{ github.event.repository.name }}/`.
3. Локально собрать каталог: `npm run data:catalog` → проверка: появился `data/catalog/<версия>.json`.
4. Локально подтянуть иконки: `npm run data:icons` → проверка: в выводе `0 missing`; уже скачанные файлы не перекачиваются.
5. Локально посмотреть сайт: `npm run dev` → проверка: сайт открывается по адресу из вывода dev-сервера.
6. Публикация: push в `master` запускает `.github/workflows/pages.yml` → проверка: во вкладке Actions прошли шаги Test, Game catalog, Icons, Build site и deploy.

## Если что-то пошло не так
- Локальная продакшен-сборка (`npm run build`) открывается без стилей и скриптов → не задан `PAGES_BASE`, по умолчанию `/SatisfactoryCalculator/` (`rsbuild.config.ts`, имя репозитория): собрать с `PAGES_BASE=/<имя репозитория>/`. В CI путь берётся из имени репозитория, см. шаг 2.
- При включении Pages ошибка `422 … does not support GitHub Pages` → репозиторий приватный на бесплатном тарифе, см. шаг 1.
- `429` при загрузке иконок → вики ограничивает частоту запросов: повторить позже, скрипт ждёт `Retry-After`.
- Шаг Game catalog падает с `does not match source.json` → см. behavior `catalog-build`.
