# satisfactory-calculator

Калькулятор производственных цепочек Satisfactory. Для человека — `README.md`.

## Где искать ответ

- как сейчас устроено X → источник реальности (`context/project.yml` →
  `reality`: код этого репозитория или целевые системы);
- почему у нас X / когда перешли на X → `CHANGELOG.md`, затем `git log`;
- как мы договорились про X → `context/conventions/<key>.yml` по ключу
  (список ключей — `context/index.yml`, если есть, иначе
  `ls context/conventions`);
- реквизиты, namespaces, внешние ссылки → `context/project.yml`;
- какие возможности подключены → `context/modules/*.yml`;
- свои роли, команды, скрипты, автоматы → `.agents/` (skill `cli`).

Читай то, на что указывает маршрут. Полный обход `docs/` и `context/`
запрещён.

## Жёсткие правила

1. Перед правкой — прочитай документы по маршруту задачи.
2. Memory агента запрещена: документация открытого типа, никаких
   скрытых знаний. «Запомни» — намерение для docs-keeper.
3. Внимание пользователя — самый дорогой ресурс: вопрос — только когда
   без решения нельзя продолжить или откатить; формат — skill `workflow`.
4. Документация только читается; правки — намерениями (skill
   `workflow`): с harness — `npx ai docs-delta start --name <имя>
   --file -`, без — субагенту `docs-keeper`; генерируемое — ai-core.
5. Ничего не создавать, не переносить, не удалять без явного «да».
6. Git-запись (commit, amend, push, merge, …) делает пользователь;
   агент — только по явной просьбе.
7. Тяжёлая работа — ролям (skill `operator`); действие наружу — только
   по `context/autonomy.yml`.

Правила в блоках возможностей ниже обязательны наравне с этими: они
дополняют жёсткие правила и не отменяют их.

## Сценарии

- `plan` — «предложи», «как лучше», «что думаешь»;
- `execute` — «делай», «поехали», «внедряй»;
- `audit` — «проверь состояние», «прогони проверку»;
- `challenge` — «покритикуй», «найди слабое место»;
- `report` — «статус», «где мы», «что активно».

Протоколы — skill `workflow`.

## Skills

- `workflow` — сценарии, формат вопроса;
- `docs-keeper` — правила записи в документацию;
- `source-sync` — обновление из источника, «что нового»;
- `source-feedback` — предложения из проекта в источник;
- `contract-setup` — «что добавить / убрать в проекте»;
- `cli` — команды `ai`, конфиг, свои расширения;
- `operator` — кому отдать работу, автономия.

<!-- блоки возможностей ниже добавляет contract-setup -->

<!-- module:domain -->
## domain

- как сейчас устроено X → `docs/entities/<id>.yml`, затем код;
- как X должно себя вести и проверено ли → `docs/behavior/<id>.yml`;
- правила слоя и `verified` → skill `domain`.
<!-- /module:domain -->

<!-- module:manuals -->
## manuals

- как сделать руками X → `docs/manuals/<name>.md`;
- формат и связи → skill `manuals`.
<!-- /module:manuals -->

<!-- module:goals -->
## goals

- что делать дальше → `context/views/goals.yaml`, затем `goal--<key>.yaml`;
- правила очереди, `goal-consistency`, отчёт о статусе → skill `goals`.
<!-- /module:goals -->

<!-- module:harness -->
## harness

- запись в документацию — `npx ai docs-delta start --file -` (правило 4);
- обновление из источника — `npx ai source-sync start`;
- свои автоматы → `.agents/harnesses/`, справка — skill `cli`.
<!-- /module:harness -->

<!-- module:code-rules-fullstack-js-ts -->
## code-rules

- стиль кода на js/ts → `context/conventions/code/<key>.yml`.
<!-- /module:code-rules-fullstack-js-ts -->
