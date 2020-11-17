import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import {
  Boundary,
  Breadcrumbs, Navbar,
} from "@blueprintjs/core";

interface HeaderTextProps {
  location: any;
}

export class HeaderText extends Component<HeaderTextProps> {

  render() {
    const path = this.props.location.pathname.slice(1);

    if (!path.length) {
      return null;
    }
    return (
      <>
        <Navbar.Divider />
        <Breadcrumbs
          items={path.split('/').map((item: string) => {
            return { href: `/${item}`, text: item }
          })}
          collapseFrom={Boundary.START}
        />
      </>
    );
  }
}

export default withRouter(HeaderText as any);