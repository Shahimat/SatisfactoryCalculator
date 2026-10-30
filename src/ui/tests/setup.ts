import { applyMessages } from '../src/i18n';
import { ru } from '../src/i18n/ru';

// Tests run in Russian, the reference dictionary; i18n.spec switches explicitly.
applyMessages('ru', ru);
