import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Loader = ({ title }) => <div className='loader-container'>
    <FontAwesomeIcon className='loader-container-spinner' icon={['fas', 'circle-notch']} spin />
    {title && <span className='loader-container-title'>{title}</span>}
</div>;

export default Loader;