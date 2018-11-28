import React from 'react';
import {Link} from 'react-router-dom'
import { Card, Divider, Icon, Popup } from 'semantic-ui-react';
import * as Markdown from 'react-markdown';


/**
 * Shortens description to fit the card
 * @param {String} desc 
 */
function shortenDescription(desc) {
    if (desc.length <= 115) {
        return desc;
    }

    // Note: 'substr' and 'substring' are different functions
    let shortDesc = desc.substr(0, 112);
    shortDesc = shortDesc.substring(0,
        (Math.max(shortDesc.lastIndexOf(' '),
            shortDesc.lastIndexOf('\n'),
            shortDesc.lastIndexOf('\t'),
            shortDesc.lastIndexOf('\r'),
            shortDesc.lastIndexOf('\u200b'),
            shortDesc.lastIndexOf('\u180e'),
            shortDesc.lastIndexOf('\u200c'),
            shortDesc.lastIndexOf('\u200d'),
            shortDesc.lastIndexOf('\u2060'),
            shortDesc.lastIndexOf('\v'),
            shortDesc.lastIndexOf('\f'),
            shortDesc.lastIndexOf('"'),
            shortDesc.lastIndexOf('\''),
            shortDesc.lastIndexOf('.'),
            shortDesc.lastIndexOf(','),
            shortDesc.lastIndexOf('!'),
            shortDesc.lastIndexOf(';'),
            shortDesc.lastIndexOf(':'),
            shortDesc.lastIndexOf('?'),
        ) + 112 % 112)) + '...'; // TODO: Use a regex or something, this is stupid...

    return shortDesc;
}

const ProjectTile = ({id, title, description, timestamp, isPublic}) => (
    <Card fluid style={{height: "200px"}}>
        <Card.Content>
            <Link to={{ pathname: "/projects/" + id}}>
                <Card.Header>
                    {
                        isPublic ?
                            <Popup trigger={
                                <Icon name="world"/>
                            } content="Public project"/>
                        : undefined
                    }
                    {title}
                </Card.Header>
            </Link>
            <Card.Description>
                <Divider/>
                <Markdown source={shortenDescription(description)}/>
            </Card.Description>
        </Card.Content>
        <Card.Content extra>
            <p><strong>Last edited:</strong> {new Date(timestamp).toLocaleDateString()}</p>
        </Card.Content>
    </Card>
)



export default ProjectTile;
