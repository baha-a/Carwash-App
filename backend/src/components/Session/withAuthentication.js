import React from 'react';

import AuthUserContext from './context';
import { withFirebase } from '../Firebase';

const withAuthentication = Component => {
  class WithAuthentication extends React.Component {
    state = {
      authUser: JSON.parse(localStorage.getItem('authUser')),
    }

    componentDidMount() {
      this.listener = this.props.firebase.onAuthUserListener(authUser => {
        localStorage.setItem('authUser', JSON.stringify(authUser));
        this.setState({ authUser, ready: true });
      },
        () => {
          localStorage.removeItem('authUser');
          this.setState({ authUser: null, ready: true });
        },
      );
    }

    componentWillUnmount() {
      this.listener();
    }

    render() {
      if (!this.state.ready) return null;
      return (
        <AuthUserContext.Provider value={this.state.authUser}>
          <Component {...this.props} />
        </AuthUserContext.Provider>
      );
    }
  }

  return withFirebase(WithAuthentication);
};

export default withAuthentication;
