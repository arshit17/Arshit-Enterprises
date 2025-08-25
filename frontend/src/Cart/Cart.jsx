import React, { useEffect, useState } from 'react';
import './Cart.css';
import { faShoppingBag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';

function Cart() {
    const [cartItems, setCartItems] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(savedCart);
    }, []);

    const calculateShipping = () => {
        const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
            const totalItemsValue = cartItems.reduce((acc, item) => acc + item.shipping, 0);
            const averagePrice = totalItemsValue / totalQuantity;
            return averagePrice;
    };

    const shippingCost = calculateShipping();
    const subtotal = cartItems.reduce((acc, item) => acc + item.Price * item.quantity, 0);
    const total = subtotal + shippingCost;

    const handleQuantityChange = (id, quantity) => {
        const updatedCart = cartItems.map(item =>
            item.id === id ? { ...item, quantity: parseInt(quantity) } : item
        );
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const handleRemoveFromCart = (id) => {
        let updatedCart = cartItems.filter(item => item.id !== id);
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        alert('Item removed from cart!');
    }

    const handleNavigate = () => {
        if (total.toFixed(2) !== '0.00') {
            navigate('/checkout', { state: { total, shippingCost, subtotal } })
        } else {
            alert('Cart is empty')
        }
    }

    return (
        <div className="cart-container">
            <h1><FontAwesomeIcon icon={faShoppingBag} /> My Cart</h1>
            <div className="cart-content">
                <div className="cart-items">
                    {cartItems.map(item => (
                        <div className="cart-item" key={item.id}>
                            <img src={item.image} alt={item.title} />
                            <div className="cart-detail">
                                <div className='cart-details'>
                                    <p className="title">{item.title}</p>
                                    <p className="info"><b>Color:</b> {item.color || 'Default'}</p>
                                    <p className="info">in Stock</p>
                                </div>
                                <div className="cart-price">
                                    <p className="price"><b>Each:</b></p>
                                    <p className='price'>₹{item.Price}</p>
                                </div>
                                <div className="quantity-total">
                                    <p><b>Quantity</b></p>
                                    <select
                                        value={item.quantity}
                                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(q => (
                                            <option key={q} value={q}>{q}</option>
                                        ))}
                                    </select>
                                </div>
                                <p><b>Total:</b> ₹{(item.Price * item.quantity).toFixed(2)}</p>
                                <p className='remove' onClick={() => handleRemoveFromCart(item.id)}>Remove</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="cart-summary">
                    <div className="promo-code">
                        <input type="text" placeholder="Promo Code" />
                        <button>Submit</button>
                    </div>
                    <hr />
                    <div className="summary-details">
                        <p>Subtotal: <span>₹{subtotal.toFixed(2)}</span></p>
                        <p>Shipping Cost: <span>₹{shippingCost.toFixed(2)}</span></p>
                        <p>Discount: <span>₹0</span></p>
                        <p>Tax: <span>TBD</span></p>
                        <p className="total">Estimated Total: <span>₹{total.toFixed(2)}</span></p>
                    </div>
                    <button className="checkout-btn" onClick={handleNavigate}>Checkout</button>
                </div>
            </div>
        </div>
    );
}

export default Cart;