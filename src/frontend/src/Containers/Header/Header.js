import React, { Component } from 'react'
import { Menu } from 'semantic-ui-react';
import MenuAuthenticated from './MenuAuthenticated';
import MenuNotAuthenticated from './MenuNotAuthenticated';

import './style.css';

class MenuClosed extends Component {
  constructor(props) { super(props); this.state = {closed: true}; }
  render() {
    return (
      <div>
        <Menu fixed="top" size='large' borderless stackable>
          <Menu.Item icon='sidebar' onClick={() => this.setState({closed:false})}/>
        </Menu>
        <div className={this.state.closed?"hidden-mobile":undefined}>
          { this.props.isAuthenticated ? 
            <MenuAuthenticated hideMenu={() => this.setState({closed:true})}/> : 
            <MenuNotAuthenticated hideMenu={() => this.setState({closed:true})}/>
          }
        </div>
      </div>
    )
  }
}

export default class Header extends Component {
  render() {
    return (
    <div>
      <MenuClosed isAuthenticated={this.props.isAuthenticated}/>
    </div>
    )
  }
}