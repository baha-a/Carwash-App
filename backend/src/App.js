import React, { useEffect } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

import { withAuthentication } from './components/Session';
import Routes from './routes';
import withGlobalStore from './components/Stores/GlobalStore';
import { withFirebase } from './components/Firebase';
import './styles/layout.css';

import SignInPage from './pages/SignIn';
import AdminSettings from './pages/dashboard/settings';

import AdminOrders from './pages/dashboard/orders';
import AdminCoupons from './pages/dashboard/coupons';
import AdminCustomers from './pages/dashboard/customers';
import AdminWashers from './pages/dashboard/washers';
import {default as AdminPage} from './pages/core_ui/index.js';

import Admin from './pages/dashboard/Admin';
import NotFoundPage from './pages/404';


const App = () => {
  return <>
    <Switch>

      <Route path={Routes.ADMIN} component={AdminPage} />

      <Route path={Routes.ADMIN_ORDERS} component={AdminOrders} />
      <Route path={Routes.ADMIN_CUSTOMERS} component={AdminCustomers} />
      <Route path={Routes.ADMIN_COUPONS} component={AdminCoupons} />
      <Route path={Routes.ADMIN_WASHERS} component={AdminWashers} />
      <Route path={Routes.ADMIN_SETTINGS} component={AdminSettings} />

      <Route path={Routes.SIGN_IN} component={SignInPage} />
      <Route path={Routes.SIGN_OUT} component={SignOutPage} />

      <Route component={NotFoundPage} />
    </Switch>

    <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}
      newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover
    />
  </>
}

const SignOutPage = withFirebase(({ firebase }) => {
  useEffect(() => { firebase.doSignOut(); }, []);
  return <div> you loged out </div>;
});

export default compose(
  withAuthentication,
  withGlobalStore,
  // withRouter,
)(App);
