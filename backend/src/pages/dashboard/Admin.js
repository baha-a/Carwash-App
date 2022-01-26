import React from 'react';
import { compose } from 'recompose';

import { withAdmin } from '../../components/Session';
import withAdminLayout from '../../components/Layouts';

const AdminPage = () => (
  <div>
    <h1>Admin Dashboard</h1>
  </div>
);

export default compose(
  withAdmin,
  withAdminLayout
)(AdminPage);

