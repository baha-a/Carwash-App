import React, { useState, useEffect } from 'react';
import { withAdmin } from '../../components/Session';
import { compose } from 'recompose';

import withAdminLayout from '../../components/Layouts';


const AdminCoupons = () => {
    return <div>
        AdminCo
    </div>;
}



export default compose(
    withAdmin,
    withAdminLayout
)(AdminCoupons);