import express from "express";

const MongoClient = require('mongodb').MongoClient;

async function maybeInitMongo(mongoUrl: string) {
  return MongoClient.connect(mongoUrl);
}

export function mongoRouterFactory(mongoUrl: string) {
  const app: express.Application = require('express')();
  app.get('/databases', async (req, res) => {
    const { dbName } = req.params;
    try {
      const client = await maybeInitMongo(mongoUrl);
      // const db = await client.db();
      const admin = await client.db('test').admin();
      const dbs = await admin.listDatabases();
      console.log('kay', dbs.databases);

      res.json({ databases: dbs.databases });

    } catch (e) {
      console.log("e", e.message);
      res.json({ databases: []});
    }
  });
  app.get('/collections/:dbName', async (req, res) => {
    const { dbName } = req.params;
    try {
      const client = await maybeInitMongo(mongoUrl);
      const db = client.db(dbName);

      const collections = await db.listCollections().toArray();
      res.json({ collections });

    } catch (e) {
      res.json({ collections: []});
    }
  });

  app.get('/collection/:dbName/:collectionName', async (req, res) => {
    const { dbName, collectionName } = req.params;
    const client = await maybeInitMongo(mongoUrl);
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const items = await collection.find().toArray();

    res.json({ items });
  });

  return app;
}