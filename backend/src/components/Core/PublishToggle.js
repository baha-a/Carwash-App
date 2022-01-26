import { toast } from "react-toastify";
const { useState } = require("react");

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
        {published ? 'now is published' : 'now is unpublished'}
    </button>
}
