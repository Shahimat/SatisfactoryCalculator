# Добавить новую версию игры в каталог

## Когда использовать
Вышла новая версия Satisfactory, нужен каталог под неё в `data/catalog/<версия>.json`.

## Шаги
1. Создать `data/raw/<версия>/` и скопировать из установки игры `CommunityResources/Docs/en-US.json` и `ru.json` (установка Steam: `…/steamapps/common/Satisfactory`).
2. Взять версию и сборку из `Engine/Binaries/Win64/FactoryGameSteam-Win64-Shipping.version` (поля `GameVersion`, `BuildId`).
3. Записать `data/raw/<версия>/source.json`: `gameVersion`, `gameBuild`, `branch` (ветка игры) и `files` — sha256 каждого из двух файлов (`sha256sum en-US.json ru.json`).
4. Из корня репозитория: `npm run data:catalog` → проверка: появился `data/catalog/<версия>.json`.
5. Тесты пакета: `npm --prefix src/data test` → проверка: 15 тестов проходят.
6. Если тесты или счётчики сломались на новых данных — см. особенности файлов в `docs/entities/game-catalog.yml` (`quirks_1_2`).

## Если что-то пошло не так
- `does not match source.json` → хеш файла не совпадает с записью в `source.json`: пересчитать sha256 или скопировать файл заново → behavior `catalog-build`.
- `No game versions in …/raw` → нет каталога `data/raw/<версия>/` с `source.json`.
