import React, { useContext, useEffect } from 'react';
import { action, computed, createStore, persist, StoreProvider, useStoreRehydrated } from 'easy-peasy';
import { AuthUserContext } from '../Session';
import api from '../../infra/api';


const store = createStore(persist({}, {
    storage: 'localStorage',
    mergeStrategy: 'overwrite',
}))


function WaitForStateRehydration({ children }) {
    const isRehydrated = useStoreRehydrated();
    return isRehydrated ? children : null;
}


const withGlobalStore = Component => props => {
    const user = useContext(AuthUserContext);

    useEffect(() => {
        if (user) {

        }

    }, [user]);

    return <StoreProvider store={store}>
        <WaitForStateRehydration>
            <Component props={props} />
        </WaitForStateRehydration>
    </StoreProvider>
}

export default withGlobalStore;
