import {
  AllCommunityModule,
  ModuleRegistry,
  type ColDef,
  type GridOptions,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import type { Stream } from 'src/classes';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

const gridOptions: GridOptions = {
  // Отключаем сортировку для всей таблицы
  // enableSorting: false,
};

type StreamGridProps<TDictionary extends string = string> = {
  input: Stream[];
  dictionary?: TDictionary[];
  onChangeItem?: (rowIndex: number, value: TDictionary) => void;
  onChangeValue?: (rowIndex: number, value: number) => void;
};

export const StreamGrid = <TDictionary extends string = string>(
  props: StreamGridProps<TDictionary>,
) => {
  const { input, dictionary, onChangeItem, onChangeValue } = props;

  const rows = input.map((stream) => ({
    item: stream.name,
    measure: stream.measure,
    value: stream.value,
  }));

  const columns: ColDef[] = [
    {
      field: 'item',
      editable: dictionary && Boolean(onChangeItem),
      cellEditor: dictionary ? 'agSelectCellEditor' : undefined,
      cellEditorParams: dictionary
        ? {
            values: dictionary,
          }
        : undefined,
    },
    { field: 'measure' },
    {
      field: 'value',
      editable: Boolean(onChangeValue),
      cellEditorParams: {
        min: 0,
      },
    },
  ];

  return (
    <div style={{ height: 400 }}>
      <AgGridReact
        rowData={rows}
        columnDefs={columns}
        gridOptions={gridOptions}
        onCellValueChanged={(event) => {
          if (event.rowIndex === null) {
            return;
          }
          if (event.colDef.field === 'item') {
            onChangeItem?.(event.rowIndex, event.newValue);
          } else if (event.colDef.field === 'value') {
            onChangeValue?.(event.rowIndex, event.newValue);
          }
        }}
      />
    </div>
  );
};
