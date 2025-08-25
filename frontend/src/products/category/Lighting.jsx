import React, { useEffect, useState } from 'react';
import './ListingItem.css';
import './StarRating.css';
import { jwtDecode } from 'jwt-decode';

const StarRating = ({ rating = 0, showCount = false, reviewCount = 0 }) => {
    const stars = [1, 2, 3, 4, 5];
    
    const getStarColor = (starValue) => {
        return starValue <= rating ? '#ffd700' : '#ccc';
    };

    return (
        <div className="star-rating">
            {stars.map((star) => (
                <span
                    key={star}
                    className="star"
                    style={{
                        color: getStarColor(star)
                    }}
                >
                    ★
                </span>
            ))}
            <span className="rating-text">
                {rating > 0 ? (
                    <>
                        {rating.toFixed(1)}/5
                        {showCount && reviewCount > 0 && (
                            <span className="review-count">
                                {` (${reviewCount} review${reviewCount !== 1 ? 's' : ''})`}
                            </span>
                        )}
                    </>
                ) : 'No ratings yet'}
            </span>
        </div>
    );
};

function Lighting({ searchQuery = "" }) {
    const [data, setData] = useState([]);
    const [ratings, setRatings] = useState({});
    const [cart, setCart] = useState([]);
    const token = localStorage.getItem('token');
    let userEmail = '';

    if (token) {
        try {
            const decoded = jwtDecode(token);
            userEmail = decoded.email;
        } catch (err) {
            console.error('Invalid Error', err);
        }
    }

    useEffect(() => {
        fetch('http://localhost:5500/getdata')
            .then(res => res.json())
            .then(data => setData(data))
            .catch(err => console.log(err));
    }, []);

    useEffect(() => {
        fetch('http://localhost:5500/product-ratings')
            .then(res => res.json())
            .then(ratingsData => {
                const ratingsMap = {};
                ratingsData.forEach(item => {
                    ratingsMap[item.item_id] = {
                        avgRating: parseFloat(item.avgRating),
                        count: parseInt(item.count)
                    };
                });
                setRatings(ratingsMap);
            })
            .catch(err => console.log('Error fetching ratings:', err));
    }, []);

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`http://localhost:5500/deleteitem/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setData(prev => prev.filter(item => item.id !== id));
                alert("Item deleted");
            } else {
                alert('Failed to delete item');
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert("Error deleting item");
        }
    };

    const handleAddToCart = (item) => {
        const existingCart = JSON.parse(localStorage.getItem('cart')) || [];

        const itemIndex = existingCart.findIndex(cartItem => cartItem.id === item.id);

        let updatedCart;

        if (itemIndex !== -1) {
            updatedCart = existingCart.map(cartItem =>
                cartItem.id === item.id
                    ? { ...cartItem, quantity: cartItem.quantity + 1 }
                    : cartItem
            );
        } else {
            updatedCart = [...existingCart, { ...item, quantity: 1 }];
        }

        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        alert("Item added to cart!");
    };

    const filteredData = data.filter(item => {
        const searchLower = searchQuery.toLowerCase();
        return (
            item.name?.toLowerCase().includes(searchLower) ||
            item.title?.toLowerCase().includes(searchLower) ||
            item.Price?.toString().includes(searchQuery)
        );  
    });

    return (
        <div>
            <div className='ListingItem'>
                <h1>Lightings</h1>
                <div className="item">
                    {filteredData.length > 0 ? (
                        filteredData
                            .filter(d => d.category === 'Lightings')
                            .map(d => {
                                const itemRating = ratings[d.id];
                                return (
                                    <div key={d.id} className="sepItem">
                                        <img src={d.image} alt={d.title} />
                                        <p className="item-title">
                                            {d.title}
                                        </p>

                                        <StarRating 
                                            rating={itemRating?.avgRating || 0}
                                            showCount={true}
                                            reviewCount={itemRating?.count || 0}
                                        />
                                        
                                        <p className="item-price">
                                            &#8377; {d.Price}
                                        </p>
                                        
                                        <div className="button-container">
                                            <button 
                                                onClick={() => handleAddToCart(d)}
                                                className="add-cart-button"
                                            >
                                                Add to Cart
                                            </button>
                                            
                                            {userEmail === 'mittalarshit56@gmail.com' && (
                                            <button 
                                                onClick={() => handleDelete(d.id)}
                                                className="delete-item-button"
                                            >
                                                Delete Item
                                            </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                    ) : (
                        <p className="no-items-message">
                            {searchQuery ? `No items found matching "${searchQuery}"` : 'No matching items found.'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Lighting;
