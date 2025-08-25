import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './Checkout.css'

function Checkout() {
    const { state } = useLocation();
    const cartTotal = state?.total || 0;

    const [cartItems, setCartItems] = useState([]);
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(savedCart);
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserEmail(payload.email || '');
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        }
    }, []);

    const [form, setForm] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        notes: ''
    });

    const handle = e =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const payNow = async e => {
        e.preventDefault();
        if (!cartTotal) return alert('Cart is empty!');

        const { data: order } = await axios.post(
            'http://localhost:5500/create-order',
            { amount: cartTotal }
        );

        const options = {
            key: 'rzp_test_iGSQvW31zP8CSu',
            amount: order.amount,
            currency: 'INR',
            name: 'Arshit Enterprises',
            description: 'Order Payment',
            order_id: order.id,
            prefill: {
                name: form.name,
                contact: form.phone
            },
            theme: { color: '#3399cc' },
            handler: async response => {
                await axios.post(
                    'http://localhost:5500/verify-payment',
                    {
                        orderId: order.id,
                        paymentId: response.razorpay_payment_id,
                        signature: response.razorpay_signature,
                        customer: {
                            ...form,
                            amount: cartTotal,
                            items: cartItems,
                            email: userEmail
                        }
                    }
                );
                alert('Payment successful!');
                localStorage.removeItem('cart');
                window.location.href = '/orders';
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    return (
        <div className="checkout-container">
            <h2>Delivery Details</h2>

            <form className="checkout-form" onSubmit={payNow}>
                <input name="name" placeholder="Full Name*" required
                    value={form.name} onChange={handle} />
                <input name="phone" placeholder="Phone Number*" required
                    value={form.phone} onChange={handle} />
                <textarea name="address" placeholder="Street Address*" required
                    value={form.address} onChange={handle} />
                <div className="row">
                    <input name="city" placeholder="City" required
                        value={form.city} onChange={handle} />
                    <input name="state" placeholder="State" required
                        value={form.state} onChange={handle} />
                </div>
                <input name="pincode" placeholder="Pincode" required
                    value={form.pincode} onChange={handle} />
                <textarea name="notes" placeholder="Any special notes" required
                    value={form.notes} onChange={handle} />
                <button type="submit">Pay ₹{cartTotal.toFixed(2)}</button>
            </form>
        </div>
    );
}

export default Checkout;
