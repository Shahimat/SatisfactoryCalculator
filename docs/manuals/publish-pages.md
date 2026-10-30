# Опубликовать сайт калькулятора на GitHub Pages

## Когда использовать
Первый запуск публикации или проверка сайта локально перед пушем в `master`.

## Шаги
1. Включить публикацию: GitHub → Settings → Pages → Source «GitHub Actions» (один раз на репозиторий).
2. Чтобы адрес был `/satisfactory-calculator/`: Settings → General → Rename, имя `satisfactory-calculator` → проверка: адрес репозитория совпадает с `PAGES_BASE` в `rsbuild.config.ts`.
3. Локально собрать каталог: `npm run data:catalog` → проверка: появился `data/catalog/<версия>.json`.
4. Локально подтянуть иконки: `npm run data:icons` → проверка: в выводе `0 missing`; уже скачанные файлы не перекачиваются.
5. Локально посмотреть сайт: `npm run dev` → проверка: сайт открывается по адресу из вывода dev-сервера.
6. Публикация: push в `master` запускает `.github/workflows/pages.yml` → проверка: во вкладке Actions прошли шаги Test, Game catalog, Icons, Build site и deploy.

## Если что-то пошло не так
- Сайт открывается без стилей и скриптов → неверный `PAGES_BASE`: имя репозитория должно совпадать с путём, см. шаг 2.
- `429` при загрузке иконок → вики ограничивает частоту запросов: повторить позже, скрипт ждёт `Retry-After`.
- Шаг Game catalog падает с `does not match source.json` → см. behavior `catalog-build`.
