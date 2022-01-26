import withAuthorization from './withAuthorization';

const isAdmin = authUser => authUser && authUser.role == 'admin';

const withAdmin = Component => withAuthorization(isAdmin)(Component);

export default withAdmin;
export { isAdmin };

