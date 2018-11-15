import { Link } from '@reach/router';
import classNames from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';

import './overlay-menu.scss';

interface MenuEntryProps {
  text: string;
  to: string;
}

export interface OverlayMenuProps {
  isOpen: boolean;

  onRequestMenuClose?: React.MouseEventHandler;
}

interface OverlayMenuState {
  element: HTMLElement | null;
}

const MenuEntry: React.SFC<MenuEntryProps> = ({ text, to }) => (
  <Link
    to={to}
    getProps={({ isCurrent }) => ({ className: classNames('menu-entry', { ['active']: isCurrent })})}
  >
    {text}
  </Link>
)

class OverlayMenu extends React.Component<OverlayMenuProps, OverlayMenuState> {
  state = {
    element: null,
  };

  componentDidMount() {
    const el = document.createElement('div');
    document.body.appendChild(el);

    this.setState({ element: el });
  }

  componentWillUnmount() {
    const el: HTMLElement | null = this.state.element;
    if (el) {
      (el as HTMLElement).remove();
    }
  }

  render() {
    if (!this.state.element) {
      return null;
    }

    const dom = (
      <div
        className={classNames('overlay-menu', { ['visible']: this.props.isOpen })}
        onClick={this.props.onRequestMenuClose}
      >
        <div className="inner" role="nav">
          <MenuEntry text="Karte" to="/map"/>
          <MenuEntry text="Buchungen" to="/bookings"/>
          <MenuEntry text="Tarif" to="/plan"/>
          <MenuEntry text="Rechnungen" to="/invoices"/>
          <MenuEntry text="Persönliche Daten" to="/personal-data"/>
          <MenuEntry text="Support" to="/support"/>
          <MenuEntry text="Impressum" to="/impressum"/>
        </div>
      </div>
    );

    return ReactDOM.createPortal(dom, this.state.element!);
  }
}

export default OverlayMenu;
