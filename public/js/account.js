import axios from 'axios';
import { showAlert } from './alert';

//type here can be wither 'password' or 'data
export const updateSettings = async (reqObj, type) => {
    try {
        const url = type === 'password' ? 'update-password' : 'update-user';
        const res = await axios({
            url: 'http://localhost:3000/api/v1/users/'+url,
            method: 'PATCH',
            data: reqObj
        });
        if (res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} updated successfully`);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}