// @ts-nocheck
import React, { Component } from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";

export class Table extends Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      data: props.data
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
        style={{ backgroundColor: "#fafafa" }}
        contentEditable
        suppressContentEditableWarning
        onBlur={e => {
          const data = [...this.state.data];
          if (!data[cellInfo.index]) {
            return;
          }
          data[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
          onChange(cellInfo);
          this.setState({ data });
        }}
        dangerouslySetInnerHTML={{
          __html: value
        }}
      />
    );
  }

  render() {
    const { data, columns } = this.props;
    return (
      <div>
        <ReactTable
          data={data}
          columns={columns.map(column => {
            return {...column, Cell: this.renderEditable }
          })}
          defaultPageSize={15}
          className="-striped -highlight"
        />
      </div>
    )
  }
}