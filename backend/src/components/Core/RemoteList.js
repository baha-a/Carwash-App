import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import Loader from "./Loader";

const useFetcher = ({ remoteFetchFunc, cacheKey }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [items, setItems] = useState(cacheKey ? JSON.parse(localStorage.getItem(cacheKey)) || [] : []);

    const fetcher = () => {
        if (cacheKey || (items && items.length && items.length === 0))
            setLoading(true);
        setError(null);

        return remoteFetchFunc()
            .then(data => {
                setItems(data);
                if (cacheKey)
                    localStorage.setItem(cacheKey, JSON.stringify(data));
            })
            .catch(ex => {
                setError(ex.message)
            })
            .finally(() => setLoading(false));
    }

    return [loading, error, items, fetcher];
}

const RemoteList = ({ remoteFetchFunc, cacheKey, title, builder, titlePadding = false }) => {
    const [loading, error, items, fetcher] = useFetcher({ remoteFetchFunc, cacheKey });
    useEffect(fetcher, [remoteFetchFunc, title]);

    return <div className='campaign-container'>
        {title && <p className={'section-title' + (titlePadding ? ' section-title-padding' : '')}>{title}</p>}

        {loading && <Loader />}
        {
            !loading && error && <div className='campaign-container-error'>
                <FontAwesomeIcon className='campaign-container-error-icon' icon={['fas', 'exclamation-triangle']} />
                <div>{error} - <button onClick={fetcher}>{'retry'}</button></div>
            </div>
        }
        {
            !loading && !error && (items.length == 0 || !items) &&
            <div className='campaign-container-error'>
                <FontAwesomeIcon className='campaign-container-error-icon' icon={['fas', 'exclamation-triangle']} />
                <span>{'Nothing Found'}</span>
            </div>
        }
        {!loading && !error && (items.length > 0 || (!!items && !!items.id)) && builder(items, fetcher)}
    </div>
}


export default RemoteList;