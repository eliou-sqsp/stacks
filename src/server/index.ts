import fs from 'fs';
import express from 'express';
import bodyParser from 'body-parser';
import got from 'got';
import path from "path";

import { Rest } from '../common/models/stack/stack';
import { Stacks } from '../common/models/stacks/stacks';
import { doSync } from "./fs-stuff/do-sync";
import { mongoRouterFactory } from "./routes/mongo";
import { Paths } from "./models/paths";
import { HEALTHCHECKS } from "./health";

export function startApp(stacks: Stacks, paths: Paths, dockerEndpoint: string) {
  const app: express.Application = require('express')();
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.get('/health', async (req, res) => {
    const containersRespStr = await got(path.join(dockerEndpoint, '/endpoints/1/docker/containers/json?all=1'));
    const containersResp = JSON.parse(containersRespStr.body);

    for (const healthCheck of HEALTHCHECKS) {
      const { stackName, serviceName } = healthCheck;
      const stack = stacks.get(stackName);
      const configService = stack.get(serviceName);
      const container = containersResp.find((c: Rest) => c.Names.join('').includes(configService.containerName));
      const service = await healthCheck.hydrate(stack, container);
      stacks = stacks.change(stackName, stack.setService(service));
    }

    res.json(stacks);
  });

  app.use('/mongo', mongoRouterFactory(`mongodb://localhost:27017/?replicaSet=rs0`));
  app.post('/save-config', async (req, res) => {
    const { diff } = req.body;
    try {
      await doSync(diff, paths);
      res.json({ OK: 'ok' });

    } catch (e) {
      res.status(500).json({ err: e });
    }
  });

  app.get('/container-logs/:containerId', async (req, res) => {
    const { containerId } = req.params;

    const url = `http://localhost:9005/api/endpoints/1/docker/containers/${containerId}/logs?since=0&stderr=1&stdout=1&tail=100&timestamps=0`;
    const resp = await got(url).text();
    res.send(resp);
    res.end();
  });

  app.get('/logs/:stackName', async (req, res) => {
    const { stackName } = req.params;
    const path = paths.logs + `${stackName}-post-start.log`;
    if (!fs.existsSync(path)) {
      res.write('No log');
      res.end();
    } else {
      const log = fs.readFileSync(path, 'utf8');
      res.write(log);
      res.end();
    }
  });

  app.listen(3001, () =>
    console.log('Express server is running on localhost:3001')
  );

  return app;
}

