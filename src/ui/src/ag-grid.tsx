import {
  AllCommunityModule,
  ModuleRegistry,
  type ColDef,
  type GridOptions,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import { useState } from 'react';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

const gridOptions: GridOptions = {
  // Отключаем сортировку для всей таблицы
  // enableSorting: false,
};

export const GridExample = () => {
  // Row Data: The data to be displayed.
  const [rowData, setRowData] = useState([
    { make: 'Tesla', model: 'Model Y', price: 64950, electric: true },
    { make: 'Ford', model: 'F-Series', price: 33850, electric: false },
    { make: 'Toyota', model: 'Corolla', price: 29600, electric: false },
  ]);

  // Column Definitions: Defines the columns to be displayed.
  const [colDefs, setColDefs] = useState<ColDef[]>([
    { field: 'make' },
    { field: 'model' },
    { field: 'price' },
    { field: 'electric' },
  ]);

  // ...

  return (
    // Data Grid will fill the size of the parent container
    <div style={{ height: 500 }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={colDefs}
        gridOptions={gridOptions}
      />
    </div>
  );
};
