import './App.scss';

import React, { Component } from 'react';
import {
  Intent,
  Button,
  Dialog,
  Classes, Callout
} from "@blueprintjs/core";
import Skeleton from '@yisheng90/react-loading';
import MongoView from './mongo-view/mongo-view';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import Header from "./header/header";
import { Stack, StackName } from "../common/models/stack/stack";
import { Diff, Stacks } from "../common/models/stacks/stacks";
import { ROUTES } from "./routes/routes";
import { StackComponent } from "./components/stack-component/stack-component";


export interface AppProps {
}

export interface AppState {
  stacks?: Stacks;
  diffs?: Diff[];
  saveConfigOpen?: boolean;
  restartInstructions?: string;
}

class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {};
  }

  async checkHealth() {
    const healthResponse = await fetch(
      '/health',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    const stacksWithHealth = await healthResponse.json();
    this.setState({
      stacks: Stacks.fromJSON(stacksWithHealth)
    });
  }

  async componentDidMount() {
    await this.checkHealth();

    setInterval(() => {
      this.checkHealth()
    }, 5000);
  }

  onSaveConfig = async (diff: any) => {
    await fetch(
      '/save-config',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ diff })
      }
    );

    let newState = {
      restartInstructions: 'Configuration updated',
      diffs: undefined,
    };

    this.setState(newState);
  }

  onToggleStack = (updatedStack: Stack) => {
    const { stacks } = this.state;
    if (!stacks) {
      return;
    }

    const updatedStacks = stacks.change(updatedStack.name as any, updatedStack);
    const diffs = Stacks.computeDisabledDiff(stacks, updatedStacks);
    this.setState({
      diffs,
    });
  }

  onToggleSaveConfigDialog = () => {
    this.setState({
      saveConfigOpen: !this.state.saveConfigOpen,
      restartInstructions: undefined,
    });
  }

  renderStack(stackName: StackName) {
    const { stacks } = this.state;
    if (!stacks || !stacks.get(stackName)) {
      console.log("NO STACK", stacks, stackName);
      return null;
    }
    return <StackComponent
      columns={[
        {
          title: 'Service',
          property: 'service'
        },
        {
          title: 'Name',
          property: 'name'
        },
        {
          title: 'Container status',
          property: 'containerStatus'
        },
        {
          title: 'Last checked',
          property: 'lastChecked'
        },
        {
          title: 'Image',
          property: 'image'
        },
        {
          title: 'Error',
          property: 'error'
        },
        {
          title: 'Container actions',
          property: 'containerActions'
        }
      ]}
      stack={stacks.get(stackName)}
      onToggleDisabled={(updatedStack: Stack) => this.onToggleStack(updatedStack)}
    />
  }

  renderServiceMesh() {
    const { stacks } = this.state;
    if (!stacks) {
      return null;
    }

    const route = ROUTES['serviceMesh'];
    if (!route) {
      return null;
    }

    return <Router basename="/service-mesh">
      <Route path="/discovery" exact={true}>
        <iframe src={route.discovery!.clientUrl} title="discovery" />
      </Route>
      <Route path="/envoy" exact={true}>
        <iframe src={route.envoy!.clientUrl} title="envoy" />
      </Route>
      <Route path="/" exact={true}>
        {this.renderStack('serviceMesh')}
      </Route>
    </Router>;
  }

  renderEcho() {
    const { stacks } = this.state;
    if (!stacks) {
      return null;
    }

    return <Router basename="/service-mesh">
      <Route path="/echo/echo" exact={true}>
        <iframe src="http://localhost:8500" title="echo" />
      </Route>
      <Route path="/echo/brick-redis" exact={true}>
        <iframe src="http://localhost:9002" title="brick-redis" />
      </Route>
      <Route path="/" exact={true}>
        {this.renderStack('echo')}
      </Route>
    </Router>;
  }

  renderCore(isHome: boolean) {
    const { stacks } = this.state;
    if (!stacks) {
      console.log("NO STACKS");
      return null;
    }

    return <Router basename="/core">
      <Route path="/mongo">
        <MongoView />
      </Route>
      <Route path="/consul" exact={true}>
        <iframe src="http://localhost:8500/ui/dc1/services/consul" title="consul" />
      </Route>
      <Route path="/warden" exact={true}>
        <iframe src="http://localhost:8060" title="warden" />
      </Route>
      <Route path="/" exact={true}>
        {isHome ? this.renderStack('core'): <div className="main-content">{this.renderStack('core')}</div>}
      </Route>
    </Router>;
  }

  renderHome() {
    return <div className="home">
      {this.renderCore(true)}
      {this.renderServiceMesh()}
      {this.renderEcho()}
    </div>
  }


  renderSaveConfigModal = () => {
    const { diffs, restartInstructions } = this.state;
    if (!diffs) {
      return null;
    }

    const disablingCore = diffs.find((diff: any) => diff.name === 'core' && diff.newState === 'disabled');

    let innerText: JSX.Element;
    if (restartInstructions) {
      innerText = <div>
        {restartInstructions}
        <pre className="bp3-code">~/squarespace/generated/bin/sqsp-restart.sh</pre>
      </div>
    } else {
      innerText = <div>{diffs.map((diff: any) => {
        if (diff.newState === 'disabled') {
          return <p key={diff.name}>Disabling {diff.name}</p>;
        } else {
          return <p key={diff.name}>Enabling {diff.name}</p>
        }
      })}</div>
    }

    let buttons: JSX.Element;
    if (restartInstructions) {
      buttons = <div className={Classes.DIALOG_FOOTER_ACTIONS}>
        <Button
          intent={Intent.PRIMARY}
          onClick={async () => {
            this.onToggleSaveConfigDialog()
          }}
          text="Close"
        />
      </div>
    } else {
      buttons = <div className={Classes.DIALOG_FOOTER_ACTIONS}>
        <Button text="Cancel" onClick={this.onToggleSaveConfigDialog} />
        <Button
          intent={Intent.PRIMARY}
          onClick={async () => {
            await this.onSaveConfig(diffs);
          }}
          text="Update"
        />
      </div>;
    }
    return <Dialog
      isOpen={this.state.saveConfigOpen}
      onClose={this.onToggleSaveConfigDialog}
      title="Update stacks.properties"
    >
      <div className={Classes.DIALOG_BODY}>
        {
          disablingCore && <Callout title="Warning" intent={Intent.WARNING} icon="warning-sign">
            Stopping or disabling core is likely to cause issues for your service.
          </Callout>
        }
        {
          !disablingCore && innerText
        }
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        {buttons}
      </div>
    </Dialog>
  }

  renderRouter() {
    const { diffs } = this.state;
    return <Router>
      <Header
        onCancelClick={() => {
          this.setState({
            diffs: undefined,
          })
        }}
        onSaveClick={diffs && diffs.length ? this.onToggleSaveConfigDialog : undefined}
      />
      <Switch>
        <Route path="/service-mesh">
          <div className="main-content">{this.renderServiceMesh()}</div>
        </Route>
        <Route path="/core">
          {this.renderCore(false)}
        </Route>
        <Route path="/" exact={true}>
          {this.renderHome()}
        </Route>
      </Switch>
    </Router>
  }

  renderLoader() {
    return <div className="loader">
      <Router>
        <Header/>
      </Router>
      <Skeleton height="100%"/>
    </div>
  }

  render() {
    const { stacks } = this.state;

    return (
      <div className="App">
        {stacks ? this.renderRouter() : this.renderLoader()}
        {this.renderSaveConfigModal()}
      </div>
    );
  }
}

export default App;
