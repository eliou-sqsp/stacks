import "./stack-component.scss";

import React, { Component } from "react";
import {
  Button,
  Menu,
  MenuItem,
  Popover,
  Position
} from "@blueprintjs/core";
import classNames from "classnames";
import { Stack } from "../../../common/models/stack/stack";
import { ROUTES } from "../../routes/routes";
import { ServiceCard } from "../service-card/service-card";
import { Service, ServiceName } from "../../../common/models/service/service";
const capitalize = (s: string) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export interface StackComponentProps {
  columns: { property: string, title: string }[];
  stack: Stack;
  onToggleDisabled: (updatedStack: Stack) => void;
}

export class StackComponent extends Component<StackComponentProps, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      disabled: props.stack.disabled
    };
  }

  renderActionMenu(getLogs: () => void, onToggle: () => void) {
    const { stack} = this.props;

    const disabled = stack.disabled;
    return  <Menu>
      <MenuItem icon="th-list" text="Logs" onClick={getLogs} />
      {disabled ? <MenuItem icon="pause" text="Disable" onClick={onToggle} /> : <MenuItem icon="play" text="Enable" onClick={onToggle}/>}
    </Menu>
  }

  render() {
    const { stack, onToggleDisabled, columns } = this.props;
    const stackName = stack.name;
    const disabled = stack.disabled;

    return <div className="stack">
      <div className="stack-control">
        <div className={classNames("stack-control-title", { disabled })}>
          {capitalize(stackName)}
        </div>
        <div className="actions">
          <Popover
            content={
              this.renderActionMenu(
                () => window.open('http://localhost:3001/logs/' + stackName, '_blank'),
                () => {
                  onToggleDisabled(stack.toggleDisabled())
                })
            }
            position={Position.TOP}>
            <Button rightIcon="caret-down" text="Manage stack" minimal={true} outlined={true} />
          </Popover>
        </div>
      </div>
      <div className="stack-headers">
        {columns.map(column => {
          return <div className={classNames("stack-header", column.property)} key={column.property}>
            {column.title}
          </div>;
        })}
      </div>
      <div className="stack-group">
        {
          stack.services && stack.getServicesAsList().map((service: Service) => {
            const stackRoute = ROUTES[stackName];
            if (!stackRoute) {
              throw new Error(`Could not get stack route for ${stackName}`);
            }

            const route = stackRoute[service.name as ServiceName];

            if (!route) {
              throw new Error(`Could not get service route for ${JSON.stringify(stackRoute)}, ${service.name}`);
            }

            return <ServiceCard
              stackDisabled={!!stack.disabled}
              key={service.name}
              route={route}
              service={service}
              columns={columns}
            />
          })
        }
      </div>
    </div>
  }
}