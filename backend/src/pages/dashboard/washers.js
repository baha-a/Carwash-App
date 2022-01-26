import React, { useState, useEffect } from 'react';
import ReactModal from 'react-modal';
import { compose } from 'recompose';

import api from 'src/infra/api';
import { withAdmin } from '../../components/Session';
import withAdminLayout from '../../components/Layouts';


const AdminWashers = () => {
    const [washers, setWashers] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [modalContent, setModalContent] = useState({});

    useEffect(() => {
        api.getWashers()
            .then(x => setWashers(x));
        return () => { };
    }, []);

    return <>
        {washers.length}
        {washers.map(w => <WasherRow
            key={w.id}
            washer={w}
            servicesOpenHandler={(modalContent) => {
                setIsOpen(true);
                setModalContent(modalContent);
            }} />)}
        <button onClick={() => setIsOpen(true)}> +++++ </button>

        <ReactModal
            isOpen={isOpen}
            onRequestClose={() => setIsOpen(false)}
            overlayClassName='bottom-up-modal-overly'
            className='bottom-up-modal'
            ariaHideApp={false}
        >
            {modalContent}
        </ReactModal>
    </>;
}

const WasherRow = ({ washer, servicesOpenHandler }) => {
    return <div className='admin-product-row'>
        <div className='admin-product-sub-row'>
            <img src={washer.photo} className='admin-product-img' />
            <div className='admin-product-content'>
                <span className='admin-product-title'>{washer.name}</span>
                <span className='admin-product-desc'>{washer.type}</span>
                <span className='admin-product-desc'>{washer.address}</span>
            </div>
        </div>
        <div className='admin-product-content'>
            <button onClick={() => servicesOpenHandler(washer)}>services</button>
            <PublishToggle item={washer.isAvailable} onChange={() => {

            }} />
        </div>
    </div>;
}

export const PublishToggle = ({ item, onChange }) => {
    const [published, setPublished] = useState(item.published);

    return <button onClick={() => {
        onChange({ id: item.id, value: !published })
            .then(() => {
                setPublished(!published);
                toast.success('successfuly saved');
            })
            .catch(() => toast.error('Error'));
    }}>
        {published ? 'now is active' : 'now is inactive'}
    </button>
}


export default compose(
    withAdmin,
    withAdminLayout
)(AdminWashers);