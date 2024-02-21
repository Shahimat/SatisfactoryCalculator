// import {
//   Table,
//   TableBody,
//   TableHead,
//   TableCell,
//   TableRow,
// } from '@mui/material';
import './index.scss';

interface TableProps {}

const SFTable = ({ ...props }: TableProps) => {
  return (
    <table className={'sf-table'}>
      <thead className={'sf-table__head'}>
        <tr className={'sf-table__head_row'}>
          <th className={'sf-table__head_cell'}>1</th>
          <th className={'sf-table__head_cell'}>2</th>
          <th className={'sf-table__head_cell'}>3</th>
        </tr>
      </thead>
      <tbody className={'sf-table__body'}>
        <tr
          className={'sf-table__body_row'}
          onClick={() => {
            console.log('da!');
          }}
        >
          <td className={'sf-table__body_cell'}>1</td>
          <td className={'sf-table__body_cell'}>2</td>
          <td className={'sf-table__body_cell'}>3</td>
        </tr>
        <tr
          className={'sf-table__body_row'}
          onClick={() => {
            console.log('da!');
          }}
        >
          <td className={'sf-table__body_cell'}>1</td>
          <td className={'sf-table__body_cell'} rowSpan={2}>
            2
          </td>
          <td className={'sf-table__body_cell'}>3</td>
        </tr>
        <tr
          className={'sf-table__body_row'}
          onClick={() => {
            console.log('da!');
          }}
        >
          <td className={'sf-table__body_cell'}>1</td>
          {/* <td className={'sf-table__body_cell'}>2</td> */}
          <td className={'sf-table__body_cell'}>3</td>
        </tr>
      </tbody>
    </table>
    // <Table border={0}>
    //   <TableHead>
    //     <TableRow>
    //       <TableCell>1</TableCell>
    //       <TableCell>2</TableCell>
    //       <TableCell>3</TableCell>
    //     </TableRow>
    //   </TableHead>
    //   <TableBody>
    //     <TableRow>
    //       <TableCell>1</TableCell>
    //       <TableCell>2</TableCell>
    //       <TableCell>3</TableCell>
    //     </TableRow>
    //     <TableRow>
    //       <TableCell>1</TableCell>
    //       <TableCell>2</TableCell>
    //       <TableCell>3</TableCell>
    //     </TableRow>
    //   </TableBody>
    // </Table>
  );
};

export default SFTable;
