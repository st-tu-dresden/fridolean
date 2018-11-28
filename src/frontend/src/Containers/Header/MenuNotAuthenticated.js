import React from 'react';
import { Icon, Menu, Button, Image } from 'semantic-ui-react'
import { Link } from 'react-router-dom';
import logo_wide from '../../img/fridolean-title-wide.png'

import './style.css';

const MenuNotAuthenticated = (props) => (
<div>
    <Menu fixed="top" size='large' borderless stackable>
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

        <Link to="/explore">
            <Menu.Item
                style={{ width: "100%", height:"100%"}}
                name='explore'
            >
                <Icon name='rocket' />
                Explore
            </Menu.Item>
        </Link>
            {
                (process.env.REACT_APP_KEYCLOAK.valueOf() === "Y") ? 
                (
                <Menu.Menu position='right'>
                <Menu.Item name='log-in' >
                    <a href={window.createLoginUrl()}>
                        <Button 
                            color="teal"
                            circular 
                        >
                        <Icon name='sign in' />                 
                        Sign in                     
                        </Button> 
                    </a>                    
                </Menu.Item>
                </Menu.Menu>
                ) : 
                (
                <Menu.Menu position='right'>
                <Menu.Item name='sign-up' >
                    <Link to="/sign-up">
                        <Button 
                            primary
                            circular 
                        >
                        <Icon name='signup' />  
                        Sign up                                
                        </Button>        
                    </Link>                
                </Menu.Item>
                <Menu.Item name='log-in' >
                    <Link to="/sign-in">
                        <Button 
                            color="teal"
                            circular 
                        >
                        <Icon name='sign in' />                 
                        Sign in                     
                        </Button> 
                    </Link>                    
                </Menu.Item>
                </Menu.Menu>
                )
            }
    </Menu>
</div>
);

export default MenuNotAuthenticated;
