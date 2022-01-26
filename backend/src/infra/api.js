import axios from "axios";
import { tokenCookie } from "../helpers/cookie";

function Api() {
    const baseurl = process.env.REACT_APP_API_URL;

    return Object.freeze({
        getAccountInfo,
        getWashers,
        getServices,
        getOrders,
        saveServiceForm
    });

    function get(url) {
        return axios.get(baseurl + url, {
            headers: { Authorization: "Bearer " + tokenCookie.get() },
        }).then(x => x.data);
    }

    function post(url, data, headers = {}) {
        return axios.post(baseurl + url,
            data,
            {
                headers: {
                    Authorization: "Bearer " + tokenCookie.get(),
                    ...headers
                },
            })
            .then(x => x.data);
    }

    function postForm(url, data) {
        return post(url, data, { 'Content-Type': 'multipart/form-data' });
    }

    // ********************************************************************

    function getAccountInfo() {
        return get('/clients/info/');
    }

    function getWashers() {
        return get('/washers/available/all');
    }

    function getServices({ washerId }) {
        return get(`/washers/${washerId}/services/`);
    }
    function getOrders() {
        return get('/orders/');
    }
    function getOrders() {
        return get('/orders/');
    }
    
    function saveServiceForm(washerId,formData) {
        return postForm('/washers/'+washerId+'/services', formData)
    }

}


export default Api();