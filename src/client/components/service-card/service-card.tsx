import './service-card.scss';

import React, { Component } from 'react';
import {
  Button,
  ButtonGroup,
  Card,
  Classes,
  Dialog,
  Elevation,
  Icon,
  Intent,
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Route } from '../../routes/routes';
import { Service } from '../../../common/models/service/service';
const relativeDate = require('tiny-relative-date').default;

export interface ServiceCardProps {
  service: Service;
  stackDisabled: boolean;
  route: Route;
  columns: { title: string; property: string }[];
}

export interface ServiceCardState {
  loadingStop?: boolean;
  loadingStart?: boolean;
  logsOpen?: boolean;
  logs?: string;
}

export class ServiceCard extends Component<ServiceCardProps, ServiceCardState> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  getServiceHealth(
    service: Service,
    stackDisabled: boolean,
    iconOnClick: () => void,
  ) {
    if (stackDisabled) {
      return {
        icon: (
          <Icon
            icon={IconNames.INFO_SIGN}
            iconSize={Icon.SIZE_STANDARD}
            intent={Intent.NONE}
          />
        ),
        lastChecked: 'Stack not enabled',
      };
    }
    let icon: JSX.Element;
    if (!service.statusDate) {
      return {
        icon: (
          <Icon
            icon={IconNames.INFO_SIGN}
            iconSize={Icon.SIZE_STANDARD}
            intent={Intent.NONE}
          />
        ),
        error: 'Not implemented',
      };
    }

    const parseError = (e: any) => {
      if (typeof e === 'string') {
        return e;
      }

      if (e.code && e.name) {
        return `${e.name}: ${e.code}`;
      }

      return e.code || e.name || e.message || e.stack;
    };

    let error: string | undefined;
    if (service.status === 'ok') {
      icon = (
        <Icon
          onClick={iconOnClick}
          icon={IconNames.TICK_CIRCLE}
          iconSize={Icon.SIZE_STANDARD}
          intent={Intent.SUCCESS}
        />
      );
    } else if (service.status === 'unknown' || !service.status) {
      icon = (
        <Icon
          onClick={iconOnClick}
          icon={IconNames.INFO_SIGN}
          iconSize={Icon.SIZE_STANDARD}
          intent={Intent.NONE}
        />
      );
    } else {
      icon = (
        <Icon
          onClick={iconOnClick}
          icon={IconNames.ERROR}
          iconSize={Icon.SIZE_STANDARD}
          intent={Intent.DANGER}
        />
      );
      error = parseError(service.error);
    }

    if (!service.rest) {
      service.rest = {};
    }

    const { Status } = service.rest;
    return {
      containerStatus: Status,
      icon,
      error,
      lastChecked: service.statusDate ? relativeDate(service.statusDate) : null,
    };
  }

  onStopContainer = async () => {
    const { service, stackDisabled } = this.props;
    if (stackDisabled) {
      return;
    }

    const { rest } = service;
    const { Id } = rest;
    const url = `http://localhost:9005/api/endpoints/1/docker/containers/${Id}/stop`;

    this.setState({
      loadingStop: true,
    });
    try {
      await fetch(url, {
        method: 'POST',
      });
    } catch (e) {
      console.error('Could not stop');
    }

    this.setState({
      loadingStop: false,
    });
  };

  onStartContainer = async () => {
    const { service, stackDisabled } = this.props;

    if (stackDisabled) {
      return;
    }

    const { rest } = service;
    const { Id } = rest;
    const url = `http://localhost:9005/api/endpoints/1/docker/containers/${Id}/start`;

    this.setState({
      loadingStart: true,
    });

    await fetch(url, {
      method: 'POST',
    });

    this.setState({
      loadingStart: false,
    });
  };

  renderLogsDialog() {
    const { service } = this.props;
    const { logs, logsOpen } = this.state;
    if (!logsOpen) {
      return null;
    }

    const onClose = () => {
      this.setState({
        logsOpen: false,
      });
    };

    return (
      <Dialog
        className="big-boi"
        isOpen={true}
        icon="th-list"
        onClose={onClose}
        title={service.name}
      >
        <div className={Classes.DIALOG_BODY}>
          <div className="logs-container">
            <pre>{logs}</pre>
          </div>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </Dialog>
    );
  }

  getLogs = async () => {
    const { service, stackDisabled } = this.props;

    if (stackDisabled) {
      return;
    }

    this.setState({
      logsOpen: true,
    });

    const { rest } = service;
    const { Id } = rest;

    const resp = await fetch(`container-logs/${Id}`, {
      method: 'GET',
    });
    const logs = await resp.text();

    this.setState({
      logs,
    });
  };

  render() {
    const { route, service, stackDisabled } = this.props;
    const iconOnClick = () => (window.location.href = route.url);

    const { icon, error, lastChecked, containerStatus } = this.getServiceHealth(
      service,
      stackDisabled,
      iconOnClick,
    );

    return (
      <>
        <div className="component-card">
          <Card interactive={true} elevation={Elevation.ONE} key={route.title}>
            <div className="card-columns">
              {icon}
              {stackDisabled ? (
                route.title
              ) : (
                <a href={route.url}>{route.title}</a>
              )}
              <div onClick={iconOnClick} className="container-status">
                {containerStatus}
              </div>
              <div onClick={iconOnClick} className="last-checked">
                {lastChecked}
              </div>
              <div onClick={iconOnClick} className="image">
                {service.rest?.Image}
              </div>
              <div onClick={iconOnClick} className="error">
                {error}
              </div>
              <ButtonGroup>
                <Button
                  loading={this.state.loadingStop}
                  onClick={this.onStopContainer}
                  outlined={true}
                  icon="stop"
                  title="Stop"
                />
                <Button
                  loading={this.state.loadingStart}
                  onClick={this.onStartContainer}
                  outlined={true}
                  icon="play"
                  title="Start"
                />
                <Button
                  onClick={this.getLogs}
                  outlined={true}
                  icon="th-list"
                  title="View logs"
                />
              </ButtonGroup>
            </div>
          </Card>
          {this.renderLogsDialog()}
        </div>
      </>
    );
  }
}
