import React, {Component} from 'react';
import { Container, Header, Segment, Grid, Divider, Image} from 'semantic-ui-react';

import Auth from '../../modules/Auth';

class Home extends Component {

    componentDidMount() {
        this.props.toggleAuthenticationStatus();        
    }

    render(){
      return(
        <div>
        {Auth.isUserAuthenticated() ? (
            <h1>Welcome, you are logged in.</h1> 
        ) : (
             <h1>Your are not logged int</h1>
        )}

        <Segment
            inverted
            textAlign="center"
            style={{ minHeight: 700, padding: '5em 0em' }}
            vertical
        >      
            <Container text>
                <Header
                    as="h1"
                    content="Fridolean"
                    inverted
                    style={{ fontSize: '3.2em', fontWeight: 'normal', marginBottom: 0, marginTop: '3em' }}
                />
                <Header
                    as='h2'
                    content='We canvanize the world.'
                    inverted
                    style={{ fontSize: '1.7em', fontWeight: 'normal' }}
                />
                <Divider/>
                {/* <Button primary size='huge'>
                    Let's go
                <Icon name='right arrow' />
              </Button> */}
            </Container>
        </Segment>

        <Segment style={{ padding: '0em' }} vertical>
            <Grid celled='internally' columns='equal' stackable>
                <Grid.Row textAlign='center'>
                    <Grid.Column style={{ paddingBottom: '5em', paddingTop: '5em' }}>
                        <Header as='h3' style={{ fontSize: '2em' }}>"What a Company"</Header>
                        <p style={{ fontSize: '1.33em' }}>That is what they all say about us</p>
                    </Grid.Column>
                    <Grid.Column style={{ paddingBottom: '5em', paddingTop: '5em' }}>
                        <Header as='h3' style={{ fontSize: '2em' }}>"I'm in love with this service."</Header>
                        <p style={{ fontSize: '1.33em' }}>
                            <Image avatar src='https://www.xing.com/image/f_9_2_63c6ea45b_18191091_7/peter-heisig-foto.1024x1024.jpg' />
                            <b>P. H.</b> CEO and entepreneur
                        </p>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Segment>

        </div>
      )
    }
}

export default Home;
