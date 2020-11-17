import './mongo-view.scss';

import React, { Component } from 'react';
import {
  MongoItem,
  MongoCollection,
} from './mongo-collection/mongo-collection';
import { Icon, ITreeNode, NonIdealState, Tree } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

export interface MongoDatabase {
  name: string;
  sizeOnDisk: number;
  empty: boolean;
}

export interface MongoCollection {
  name: string;
}

export interface MongoViewProps {}

export interface MongoViewState {
  databases?: MongoDatabase[];
  selectedDatabase?: string;
  collections: MongoCollection[];
  selectedCollection?: string;
  items?: MongoItem[];
}

class MongoView extends Component<MongoViewProps, MongoViewState> {
  constructor(props: MongoViewProps) {
    super(props);
    this.state = { collections: [] };
  }

  async componentDidMount() {
    const databasesResp = await fetch(`/mongo/databases`);
    const databases = await databasesResp.json();

    this.setState({
      databases: databases.databases,
    });
  }

  async queryCollection(collectionName: string) {
    const { selectedDatabase } = this.state;

    const response = await fetch(
      `/mongo/collection/${selectedDatabase}/${collectionName}`,
    );
    const responseJson = await response.json();
    this.setState({
      items: responseJson.items,
    });
  }

  onDatabaseClick = async (nodeData: ITreeNode) => {
    const { selectedDatabase } = this.state;
    const databaseName = nodeData.id as string;

    let collections: MongoCollection[] = [];

    try {
      const mongoCollections = await fetch(
        `/mongo/collections/${databaseName}`,
      );
      const collectionsJSON = await mongoCollections.json();
      collections = collectionsJSON.collections.sort(
        (a: MongoCollection, b: MongoCollection) =>
          a.name.localeCompare(b.name),
      );
    } catch (e) {
      collections = [];
    }

    this.setState({
      selectedDatabase:
        selectedDatabase === databaseName ? undefined : databaseName,
      collections,
    });
  };

  updateCollection = async (...args: any[]) => {
    console.log('args', args);
  };

  renderNonIdealCollection(element: JSX.Element) {
    return <div className="mongo-collection">{element}</div>;
  }

  renderCollection() {
    const { items, selectedCollection } = this.state;
    if (!items || !selectedCollection) {
      return this.renderNonIdealCollection(
        <NonIdealState
          icon="th-list"
          title="Select a collection"
          description="Select a collection to see its items"
        />,
      );
    }

    if (!items.length) {
      return this.renderNonIdealCollection(
        <NonIdealState
          icon="th-list"
          title={selectedCollection}
          description="Empty Collection"
        />,
      );
    }

    return (
      <MongoCollection
        items={items}
        collectionName={selectedCollection}
        onUpdate={this.updateCollection}
      />
    );
  }

  private handleNodeClick = (
    nodeData: ITreeNode,
    _nodePath: number[],
    e: React.MouseEvent<HTMLElement>,
  ) => {
    if (nodeData.childNodes) {
      return this.onDatabaseClick(nodeData);
    }

    const { selectedCollection } = this.state;
    if (selectedCollection === nodeData.id) {
      this.setState({
        selectedCollection: undefined,
      });

      return;
    }

    this.setState({
      selectedCollection: nodeData.id as string,
      items: [],
    });

    this.queryCollection(nodeData.id as string);
  };

  render() {
    const { databases, collections, selectedDatabase } = this.state;
    if (!databases) {
      return <NonIdealState />;
    }

    const contents = databases.map((database) => {
      const { name } = database;
      const asNode = {
        label: name,
        id: name,
        isExpanded: false,
        childNodes: [],
        icon: 'database',
      };
      if (name === selectedDatabase) {
        const childNodes = collections.map((collection) => {
          return {
            id: collection.name,
            label: collection.name,
            icon: 'th-list',
          };
        });

        return { ...asNode, isExpanded: true, childNodes };
      }

      return asNode;
    });

    return (
      <div className="mongo-view">
        <div className="left">
          <div className="tree-container">
            <div className="bp3-input-group search">
              <Icon icon={IconNames.SEARCH} />
              <input
                className="bp3-input"
                type="search"
                placeholder="Search"
                dir="auto"
              />
            </div>
            <Tree
              contents={contents as any}
              onNodeClick={this.handleNodeClick}
            />
          </div>
        </div>
        {this.renderCollection()}
      </div>
    );
  }
}

export default MongoView;
