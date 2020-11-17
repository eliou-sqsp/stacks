import React, { Component } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

export interface Column {
  Header: string;
  accessor: string;
}
export interface TableProps<T> {
  data: T[];
  onChange: (t: T) => void;
  columns: Column[];
}

export interface TableState<T> {
  data: T[];
}

export class Table<T> extends Component<TableProps<T>, TableState<T>> {
  constructor(props: TableProps<T>) {
    super(props);
    this.state = {
      data: props.data,
    };
  }

  renderEditable = (cellInfo) => {
    const { onChange } = this.props;
    const row = this.state.data[cellInfo.index];
    let value = row ? row[cellInfo.column.id] : '';
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    return (
      <div
        style={{ backgroundColor: '#fafafa' }}
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => {
          const dataCopy = [...this.state.data];
          if (!dataCopy[cellInfo.index]) {
            return;
          }
          dataCopy[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
          onChange(cellInfo);
          this.setState({ data: dataCopy });
        }}
        dangerouslySetInnerHTML={{
          __html: value,
        }}
      />
    );
  };

  render() {
    const { data, columns } = this.props;
    return (
      <div>
        <ReactTable
          data={data}
          columns={columns.map((column) => {
            return { ...column, Cell: this.renderEditable };
          })}
          defaultPageSize={15}
          className="-striped -highlight"
        />
      </div>
    );
  }
}
