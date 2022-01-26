import React, { useState, useEffect } from 'react';
import { withAdmin } from '../../components/Session';
import { compose } from 'recompose';

import withAdminLayout from '../../components/Layouts';

const AdminOrders = () => {
    return <div>
        AdminOrders
    </div>;
}

export default compose(
    withAdmin,
    withAdminLayout
)(AdminOrders);