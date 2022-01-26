import React from 'react';
import { useLocation, withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import AuthUserContext from './context';
import { withFirebase } from '../Firebase';
import Routes from '../../routes';

const withAuthorization = condition => Component => {
  class WithAuthorization extends React.Component {
    componentDidMount() {
      const returnUrl = '?returnUrl=' + window.location.pathname + window.location.search + window.location.hash;

      this.listener = this.props.firebase.onAuthUserListener(authUser => {
        if (!authUser) {
          this.props.history.push({
            pathname: Routes.SIGN_IN,
            search: returnUrl
          });
        }
        // if (!condition(authUser)) this.props.history.replace(Routes.UN_AUTHORIZED);
      }, () => this.props.history.push({
        pathname: Routes.SIGN_IN,
        search: returnUrl
      }),
      );
    }

    componentWillUnmount() { this.listener(); }

    render() {
      return <AuthUserContext.Consumer>
        {
          authUser => condition(authUser)
            ? <Component {...this.props} />
            : <UnAuthorizedAccess firebase={this.props.firebase} />
        }
      </AuthUserContext.Consumer>
    }
  }

  return compose(
    withRouter,
    withFirebase,
  )(WithAuthorization);
};

const UnAuthorizedAccess = ({ firebase }) => {
  return <div>
    You are Unauthorized to see this page
    <button onClick={() => { firebase.doSignOut(); }}>log out</button>
  </div>;
}

export default withAuthorization;
