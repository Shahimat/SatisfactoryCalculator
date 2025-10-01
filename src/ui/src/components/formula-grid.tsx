import {
  AllCommunityModule,
  ModuleRegistry,
  type ColDef,
  type GridOptions,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

const gridOptions: GridOptions = {
  // Отключаем сортировку для всей таблицы
  // enableSorting: false,
};

type FormulaGridProps<TDictionary extends string = string> = {
  input: {
    recipe: string;
    itemName: string;
    measure: string;
    factory: string;
    numberOfFactories: number;
  }[];
  dictionary?: TDictionary[];
  onChangeRecipe?: (rowIndex: number, value: TDictionary) => void;
};

export const FormulaGrid = <TDictionary extends string = string>(
  props: FormulaGridProps<TDictionary>,
) => {
  const { input, dictionary, onChangeRecipe } = props;

  const columns: ColDef[] = [
    {
      field: 'recipe',
      editable: dictionary && Boolean(onChangeRecipe),
      cellEditor: dictionary ? 'agSelectCellEditor' : undefined,
      cellEditorParams: dictionary
        ? {
            values: dictionary,
          }
        : undefined,
    },
    { field: 'itemName' },
    { field: 'measure' },
    { field: 'factory' },
    { field: 'numberOfFactories' },
  ];

  return (
    <div style={{ height: 400 }}>
      <AgGridReact
        rowData={input}
        columnDefs={columns}
        gridOptions={gridOptions}
        onCellValueChanged={(event) => {
          if (event.rowIndex === null) {
            return;
          }
          onChangeRecipe?.(event.rowIndex, event.newValue);
        }}
      />
    </div>
  );
};
