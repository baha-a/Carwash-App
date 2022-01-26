import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { withNormalLayout } from "../components/Layouts";

const NotFoundPage = () => {
    return <div className='error-page-container'>
        <div className='error-page-icon'>
            <FontAwesomeIcon icon={['fas', 'radiation']} spin />
        </div>
        <div className='error-page-code'>404</div>
        <div className='error-page-title'>{'Page Not Found'}</div>
    </div>
}

export default NotFoundPage;

