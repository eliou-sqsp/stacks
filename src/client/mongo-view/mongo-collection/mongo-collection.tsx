import React from 'react';
import { Table } from "../../components/table/table";

export type MongoItem = { _id: string } & any;

interface MongoCollectionProps {
  items: MongoItem[];
  collectionName: string;
  onUpdate: any;
}
const distinct = (value: string, index: number, self: string[]) => {
  return self.indexOf(value) === index;
}

function getAllDistinctKeys(items: MongoItem[]) {
  const keyss = items.map(item => Object.keys(item));
  const keys = ([] as MongoItem[]).concat(...keyss);
  return keys.filter(distinct);
}


export function MongoCollection(props: MongoCollectionProps) {
  const { collectionName, items, onUpdate } = props;

  const keys = getAllDistinctKeys(items);

  const columns = keys.map(key => {
    return {
      Header: key,
      accessor: key,
    }
  });

  return <div className="mongo-collection">
    <h1>{collectionName}</h1>
    <Table columns={columns} data={items} onChange={onUpdate} />
  </div>
}