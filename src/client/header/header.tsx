import './header.scss';

import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

import { Alignment, Button, Intent, Navbar } from '@blueprintjs/core';
import HeaderText from './header-text';

interface HeaderProps {
  onSaveClick?: () => void;
  onCancelClick?: () => void;
}

class Header extends Component<HeaderProps> {
  renderRight() {
    const { onSaveClick, onCancelClick } = this.props;

    if (!onSaveClick) {
      return null;
    }

    return (
      <Navbar.Group align={Alignment.RIGHT}>
        <Button className="cancel" onClick={onCancelClick}>
          Cancel
        </Button>
        <Button onClick={onSaveClick} intent={Intent.PRIMARY}>
          Save
        </Button>
      </Navbar.Group>
    );
  }
  render() {
    return (
      <Navbar className="header-bar">
        <Navbar.Group align={Alignment.LEFT}>
          <NavLink
            activeClassName="bp3-breadcrumb-current"
            className="bp3-breadcrumb"
            onClick={() => {
              window.location.href = '/';
            }}
            to="/"
          >
            <Button
              className="title"
              icon={
                <svg
                  className="squarespace-mark is-fill notranslate"
                  xmlns="http://www.w3.org/2000/svg"
                  width="30px"
                  height="24px"
                  viewBox="0 0 90 72"
                >
                  <title>Squarespace Logo</title>
                  <g data-name="Logo">
                    <path d="M18.49 38.15L46.67 10A10.16 10.16 0 0 1 61 10l2.19 2.19 4.39-4.39-2.19-2.2a16.38 16.38 0 0 0-23.14 0L14.09 33.76z"></path>
                    <path d="M56.11 19.27l-4.39-4.39-28.19 28.19A10.15 10.15 0 0 1 9.18 28.71L33.5 4.39 29.11 0 4.79 24.32a16.36 16.36 0 1 0 23.13 23.14zM84.17 24.32a16.39 16.39 0 0 0-23.14 0L32.84 52.51l4.39 4.39 28.19-28.19a10.15 10.15 0 0 1 17.32 7.18 10 10 0 0 1-3 7.18L55.45 67.39l4.4 4.39 24.32-24.32a16.38 16.38 0 0 0 0-23.14z"></path>
                    <path d="M70.47 33.63L42.28 61.81a10.17 10.17 0 0 1-14.36 0l-2.19-2.2L21.34 64l2.19 2.2a16.39 16.39 0 0 0 23.14 0L74.86 38z"></path>
                  </g>
                </svg>
              }
              minimal={true}
              title="Stacks"
            >
              Stacks
            </Button>
          </NavLink>
          <HeaderText />
        </Navbar.Group>
        {this.renderRight()}
      </Navbar>
    );
  }
}

export default Header;
