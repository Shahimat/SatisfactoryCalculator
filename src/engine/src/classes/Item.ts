import { MeasureType } from 'src/types/measure';

import { Icon } from './Icon';
import { Text } from './Text';
import { UnitValue } from './UnitValue';

export class Item<T extends MeasureType = MeasureType> {
  id: number;
  name: Text;
  icon: Icon;
  measure: T;
  stackSize: number;
  additional: UnitValue[];
}

// export class ItemSet<T extends MeasureType = MeasureType> extends Item<T> {
//   value: UnitValue<T>;
// }
