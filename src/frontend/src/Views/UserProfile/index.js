import React, {Component} from 'react';
import { connect } from 'react-redux';

import {fetchUser} from './actions';

import UserProfileForm from './UserProfileForm';

class UserProfile extends Component {
    // executed after initial rendering
    componentDidMount() {
        this.props.requestUser();        
    }

    render() {
        return(
            <UserProfileForm
                user={this.props.user}
                errors={this.props.errors}
                loading={this.props.loading}
            />
        )
    }
}

const mapStateToProps = state => {
    return {
        errors: state.userProfile.errors,
        loading: state.userProfile.loading,
        user: state.userProfile.user
    }
}

const mapDispatchToProps = dispatch => {
    return {
        requestUser: () => {
            dispatch(fetchUser());
        }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(UserProfile);
