import React from 'react';
import { Icon, Menu, Dropdown, Button, Image } from 'semantic-ui-react'
import { Link } from 'react-router-dom';
import logo_wide from '../../img/fridolean-title-wide.png'

import './style.css';

const MenuAuthenticated = (props) => (
<div>
    <Menu fixed="top" size='large' borderless stackable>
        {/* <Container text>         */}
        <div className="hidden-desktop">
            <Menu.Item icon="caret up" onClick={() => props.hideMenu()}/>
        </div>

        <Link to="/"> 
            <Menu.Item
                style={{ width: "100%", height:"100%"}}    
            >
                <Image src={ logo_wide } verticalAlign="middle" size="small"/>                 
            </Menu.Item>
        </Link>

        <Link to="/projects">
            <Menu.Item
                style={{ width: "100%", height:"100%"}}
                name='projects'
            >
                <Icon name='grid layout' />
                Projects
            </Menu.Item>
        </Link>

        <Link to="/explore">
            <Menu.Item
                style={{ width: "100%", height:"100%"}}
                name='explore'
            >
                <Icon name='rocket' />
                Explore
            </Menu.Item>
        </Link>

        <Menu.Menu position='right'>
            <Dropdown 
                trigger = {<span><Icon name='user'></Icon>Hello, User</span>}
                item 
            >
                <Dropdown.Menu>
                    <Link to="/profile">                    
                        <Dropdown.Item>
                                <Icon name='settings' />                                                        
                                Profile
                        </Dropdown.Item>
                    </Link>                    
                    {/* <Dropdown.Item>
                        <Icon name='sign out' />                                                            
                        Sign out
                    </Dropdown.Item> */}
                </Dropdown.Menu>
            </Dropdown>
            
            <Menu.Item 
                name='sign-out'
            >
                <Link to="/sign-out">
                    <Button 
                        primary
                        circular 
                    >
                    <Icon name='sign out' />  
                    Sign out                               
                    </Button>        
                </Link>                
            </Menu.Item>

        </Menu.Menu>
    </Menu>
</div>
);

export default MenuAuthenticated;
