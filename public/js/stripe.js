import axios from 'axios';
import { showAlert } from './alert';

const stripe = Stripe('pk_test_51QQ4bQLKRDbNSsrglPgzFCEydB9vO6YWtYKZ3eJ8GMGaCQUAiihqGOtCwLW09QHLXoy25vBX0KoEVhjbin21cxtB00BWaLQJjY');

export const bookTour = async (tourId) => {
    try {
        const res = await axios(`http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`);
        console.log(res.data.session);
        window.location.href = res.data.session.url;
    } catch (err) {
        showAlert('error', err);
    }
}