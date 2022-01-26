import React from 'react';
import { Link, useLocation } from 'react-router-dom'
import Routes from '../routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const meunlinks = [
    { title: 'Home', icon: 'store', url: Routes.ADMIN },

    { title: 'washers', icon: 'shower', url: Routes.ADMIN_WASHERS },
    { title: 'orders', icon: 'truck', url: Routes.ADMIN_ORDERS },
    { title: 'customers', icon: 'users', url: Routes.ADMIN_CUSTOMERS },
    { title: 'coupons', icon: 'ticket-alt', url: Routes.ADMIN_COUPONS },
    { title: 'settings', icon: 'cog', url: Routes.ADMIN_SETTINGS },
    { title: 'exit', icon: 'sign-out-alt', url: Routes.SIGN_OUT },
];

const withAdminLayout = Component => props => {
    const location = useLocation();
    return <div className='dashboard'>
        
        <div className='dashboard-content'>
            <Component {...props} />
        </div>
    </div>;
};

export default withAdminLayout;