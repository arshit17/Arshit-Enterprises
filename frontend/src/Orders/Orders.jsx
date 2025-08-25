    import React, { useEffect, useState } from "react";
    import './Orders.css';

    // StarRating Component
    const StarRating = ({ rating = 0, onChange, readOnly = false }) => {
        const [hoveredRating, setHoveredRating] = useState(0);
        const stars = [1, 2, 3, 4, 5];

        const handleStarClick = (starValue) => {
            if (!readOnly && onChange) {
                onChange(starValue);
            }
        };

        const handleMouseEnter = (starValue) => {
            if (!readOnly) {
                setHoveredRating(starValue);
            }
        };

        const handleMouseLeave = () => {
            if (!readOnly) {
                setHoveredRating(0);
            }
        };

        const getStarColor = (starValue) => {
            if (readOnly) {
                return starValue <= rating ? '#ffd700' : '#ccc';
            }

            const displayRating = hoveredRating || rating;
            return starValue <= displayRating ? '#ffd700' : '#ccc';
        };

        return (
            <div
                className="star-rating"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    marginBottom: '5px'
                }}
            >
                {stars.map((star) => (
                    <span
                        key={star}
                        className={`star ${star <= (hoveredRating || rating) ? 'filled' : ''}`}
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => handleMouseEnter(star)}
                        onMouseLeave={handleMouseLeave}
                        style={{
                            cursor: readOnly ? 'default' : 'pointer',
                            color: getStarColor(star),
                            fontSize: '1.2em',
                            userSelect: 'none',
                            transition: 'color 0.2s ease'
                        }}
                    >
                        ★
                    </span>
                ))}
                <span style={{
                    marginLeft: '8px',
                    fontSize: '0.8em',
                    color: '#666'
                }}>
                    {rating > 0 ? `${rating}/5` : readOnly ? 'No rating' : 'Click to rate'}
                </span>
            </div>
        );
    };

    function Orders() {
        const [data, setData] = useState([]);
        const [refunds, setRefunds] = useState([]);
        const [reviews, setReviews] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        const [activeTab, setActiveTab] = useState('orders');
        const [reviewInputs, setReviewInputs] = useState({});

        useEffect(() => {
            fetchOrders();
            fetchRefunds();
            fetchUserReviews();
        }, []);

        const fetchOrders = () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setError('Please login to view your orders');
                setLoading(false);
                return;
            }

            fetch('https://arshit-enterprises-backend.onrender.com/user-orders', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then(responseData => {
                    console.log('Orders fetched:', responseData);
                    setData(Array.isArray(responseData) ? responseData : []);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error fetching orders:', err);
                    setError(err.message);
                    setLoading(false);
                    setData([]);
                });
        };

        const fetchRefunds = () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            fetch('https://arshit-enterprises-backend.onrender.com/user-refunds', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(refundData => {
                    console.log('Refunds fetched:', refundData);
                    setRefunds(Array.isArray(refundData) ? refundData : []);
                })
                .catch(err => {
                    console.error('Error fetching refunds:', err);
                });
        };

        const fetchUserReviews = () => {
            const token = localStorage.getItem("token");
            if (!token) {
                console.log('No token found, skipping review fetch');
                return;
            }

            fetch("https://arshit-enterprises-backend.onrender.com/user-reviews", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            })
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then((data) => {
                    console.log('Fetched reviews:', data);
                    setReviews(Array.isArray(data) ? data : []);
                })
                .catch((err) => {
                    console.error('Error fetching reviews:', err.message);
                    setReviews([]);
                });
        };

        const handleReview = async (orderId, itemId, rating, reviewText) => {
            if (rating === 0) {
                alert('Please select a rating');
                return;
            }

            try {
                console.log('Submitting review:', { orderId, itemId, rating, reviewText });
                const res = await fetch("https://arshit-enterprises-backend.onrender.com/reviews", {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({
                        orderId,
                        itemId,
                        rating,
                        review: reviewText || ''
                    })
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || 'Failed to submit review');
                }

                console.log('Review submission response:', data);
                await fetchUserReviews();

                setReviewInputs(prev => ({
                    ...prev,
                    [`${orderId}_${itemId}`]: { rating: 0, text: '' }
                }));

                alert('Review submitted successfully!');
                return data;
            } catch (error) {
                console.error("Error submitting review:", error.message);
                const errorMessage = error.message || 'Failed to submit review. Please try again.';
                alert('Failed to submit review: ' + errorMessage);
                throw error;
            }
        };

        const handleReviewSubmit = async (orderId, itemId, rating, reviewText) => {
            if (rating === 0) {
                alert('Please select a rating before submitting');
                return;
            }

            try {
                await handleReview(orderId, itemId, rating, reviewText);
            } catch (error) {
                console.error('Review submission failed:', error);
            }
        };

        const getOrderStatus = async (orderId) => {
            try {
                const res = await fetch(`https://arshit-enterprises-backend.onrender.com/order-status/${orderId}`);
                if (res.ok) {
                    const statusData = await res.json();
                    return statusData.status;
                }
            } catch (err) {
                console.error('Error fetching order status:', err);
            }
            return null;
        };

        const handleCancelOrder = async (itemId, orderData, itemData) => {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("Please login first");
                return;
            }

            // Validate itemId
            if (!itemId) {
                alert("Invalid item ID");
                console.error('Missing itemId:', itemId);
                return;
            }

            if (!window.confirm(`Are you sure you want to cancel "${itemData.title}"?\n\nThis action cannot be undone.`)) {
                return;
            }

            // Find and disable the button
            const button = document.querySelector(`button[data-item-id="${itemId}"]`);
            if (button) {
                button.disabled = true;
                button.textContent = 'Processing...';
                button.style.backgroundColor = '#6c757d';
            }

            try {
                console.log('Attempting to cancel item with ID:', itemId);
                console.log('Item data:', itemData);
                console.log('Order data:', orderData);

                const res = await fetch(`https://arshit-enterprises-backend.onrender.com/cancel-order/${itemId}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                console.log('Response status:', res.status);

                const dataRes = await res.json();
                console.log('Response data:', dataRes);

                if (!res.ok) {
                    throw new Error(dataRes.message || `HTTP error! status: ${res.status}`);
                }

                // Verify deletion was successful
                if (dataRes.deleted && dataRes.affectedRows > 0) {
                    console.log(`Successfully deleted ${dataRes.affectedRows} item(s)`);
                    
                    // Show success message
                    let message = dataRes.message || "Order item canceled successfully";
                    if (dataRes.refund) {
                        message += `\n\nRefund Details:\nRefund ID: ${dataRes.refund.refund_id}\nAmount: ₹${dataRes.refund.amount}\nStatus: ${dataRes.refund.status}\n\nRefund will be processed within 5-7 business days.`;
                    }

                    alert(message);

                    // Refresh the data
                    await fetchOrders();
                    await fetchRefunds();
                } else {
                    throw new Error('Item was not deleted from database');
                }

            } catch (err) {
                console.error('Cancel order error:', err);
                alert(`Failed to cancel order: ${err.message}`);

                // Re-enable button on error
                if (button) {
                    button.disabled = false;
                    button.textContent = 'Cancel & Refund';
                    button.style.backgroundColor = '#dc3545';
                }
            }
        };

        const checkRefundStatus = async (refundId) => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const res = await fetch(`https://arshit-enterprises-backend.onrender.com/refund-status/${refundId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                const refundData = await res.json();
                if (res.ok) {
                    alert(`Refund Status: ${refundData.status}\nAmount: ₹${refundData.amount}\nRefund ID: ${refundData.refund_id}`);
                    fetchRefunds();
                }
            } catch (err) {
                console.error('Error checking refund status:', err);
                alert('Error checking refund status');
            }
        };

        const isCancelable = (orderDate, orderStatus) => {
            if (!orderDate) return false;

            // Don't allow cancellation for delivered items
            if (orderStatus && orderStatus.toLowerCase() === 'delivered') {
                return false;
            }

            const now = new Date();
            const placed = new Date(orderDate);
            const diffHours = (now - placed) / (1000 * 60 * 60);

            // Allow cancellation within 24 hours
            return diffHours <= 24;
        };

        const getRemainingCancelTime = (orderDate) => {
            if (!orderDate) return null;

            const now = new Date();
            const placed = new Date(orderDate);
            const diffHours = (now - placed) / (1000 * 60 * 60);
            const remainingHours = 24 - diffHours;

            if (remainingHours <= 0) return null;

            if (remainingHours < 1) {
                return `${Math.floor(remainingHours * 60)} minutes left`;
            }

            return `${Math.floor(remainingHours)} hours left`;
        };

        const getStatusColor = (status) => {
            switch (status?.toLowerCase()) {
                case 'delivered':
                    return '#28a745';
                case 'shipped':
                    return '#17a2b8';
                case 'packed':
                    return '#ffc107';
                case 'order placed':
                    return '#6c757d';
                case 'processed':
                case 'success':
                    return '#28a745';
                case 'pending':
                    return '#ffc107';
                case 'failed':
                    return '#dc3545';
                default:
                    return '#6c757d';
            }
        };

        const getStatusText = (status) => {
            return status || 'Order Placed';
        };

        const OrderStatus = ({ orderId, itemStatus, createdAt }) => {
            const [currentStatus, setCurrentStatus] = useState(itemStatus || 'Order Placed');

            useEffect(() => {
                const fetchStatus = async () => {
                    const status = await getOrderStatus(orderId);
                    if (status) {
                        setCurrentStatus(status);
                    }
                };

                fetchStatus();
                const interval = setInterval(fetchStatus, 30000);
                return () => clearInterval(interval);
            }, [orderId]);

            return (
                <span style={{
                    backgroundColor: getStatusColor(currentStatus),
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '15px',
                    fontSize: '0.9em',
                    textTransform: 'capitalize'
                }}>
                    {getStatusText(currentStatus)}
                </span>
            );
        };

        if (loading) {
            return <div style={{ textAlign: 'center', padding: '50px' }}>Loading orders...</div>;
        }

        if (error) {
            return <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>Error loading orders: {error}</div>;
        }

        return (
            <div className="orders">
                <div style={{ textAlign: 'center', padding: '2vw 0' }}>
                    <h1>Your Orders & Refunds</h1>

                    <div style={{ margin: '20px 0', display: 'flex', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
                        <button
                            onClick={() => setActiveTab('orders')}
                            style={{
                                padding: '10px 20px',
                                width: '50%',
                                backgroundColor: activeTab === 'orders' ? '#35355aff' : 'white',
                                color: activeTab === 'orders' ? 'white' : 'black',
                                border: '1px solid #35355aff',
                                borderRadius: '5px 0 0 5px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Orders ({data.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('refunds')}
                            style={{
                                padding: '10px 20px',
                                width: '50%',
                                backgroundColor: activeTab === 'refunds' ? '#35355aff' : 'white',
                                color: activeTab === 'refunds' ? 'white' : 'black',
                                border: '1px solid #35355aff',
                                borderRadius: '0 5px 5px 0',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Refunds ({refunds.length})
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <p><b>Note:</b> All returns must be made at your own expense and brought to our shop.</p>
                </div>

                {activeTab === 'orders' && (
                    <div>
                        {data.length === 0 ? (
                            <p style={{ textAlign: 'center', padding: '16vw 0' }}>No orders found</p>
                        ) : (
                            data.map((order, index) => {
                                const items = order.items || [];
                                const activeItems = items.filter(item => item.status !== 'cancelled');

                                if (activeItems.length === 0) return null;

                                return (
                                    <div className="orderItem" key={order.order_id || index} style={{ padding: '0 15px 90px 15px' }}>
                                        <div>
                                            {activeItems.map((item, idx) => {
                                                const review = reviews.find(
                                                    (r) => r.order_id === order.order_id && r.item_id === item.id
                                                );

                                                const itemDate = item.created_at ? new Date(item.created_at.replace(" ", "T")) : null;

                                                return (
                                                    <div key={item.id || idx} className="orderDetails" style={{
                                                        display: 'flex',
                                                        padding: '10px',
                                                        margin: '10px auto',
                                                        width: '90%',
                                                        backgroundColor: '#a9b1c0ff',
                                                        borderRadius: '19px'
                                                    }}>
                                                        <img
                                                            src={item.image || ""}
                                                            alt={item.title || "Product"}
                                                        />
                                                        <div style={{ width: '100%', marginLeft: '15px' }}>
                                                            <div className="orderDetail">
                                                                <p style={{ color: 'black', margin: '6px 0', fontWeight: 'bold' }}>
                                                                    {item.title}
                                                                </p>
                                                                <p style={{ color: 'black', margin: '5px 0' }}>
                                                                    <strong>Price:</strong> ₹{item.Price || item.price}
                                                                </p>
                                                                <p style={{ color: 'black', margin: '5px 0' }}>
                                                                    <strong>Category:</strong> {item.category}
                                                                </p>
                                                                <p style={{ color: 'black', margin: '5px 0' }}>
                                                                    <strong>Quantity:</strong> {item.quantity}
                                                                </p>
                                                                <p style={{ color: 'black', margin: '5px 0' }}>
                                                                    <strong>Subtotal:</strong> ₹{item.subtotal || (item.Price || item.price) * item.quantity}
                                                                </p>
                                                                <p style={{ color: 'black', margin: '5px 0', fontSize: '0.85em' }}>
                                                                    <strong>Order Date:</strong> {itemDate ? itemDate.toLocaleDateString('en-IN') : 'N/A'}
                                                                </p>
                                                            </div>

                                                            <div className="status" style={{
                                                                display: "flex", 
                                                                width: '100%', 
                                                                justifyContent: 'space-between',
                                                                alignItems: 'flex-start',
                                                                marginTop: '10px',
                                                                flexWrap: 'wrap',
                                                                gap: '10px'
                                                            }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                                    <span style={{ fontWeight: 'bold' }}>Status:</span>
                                                                    <OrderStatus
                                                                        orderId={order.order_id}
                                                                        itemStatus={item.status || order.status}
                                                                        createdAt={order.created_at}
                                                                    />

                                                                    {/* Cancellation Logic */}
                                                                    {isCancelable(order.created_at, item.status) ? (
                                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                                            <button
                                                                                data-item-id={item.id}
                                                                                style={{
                                                                                    backgroundColor: '#dc3545',
                                                                                    color: 'white',
                                                                                    border: 'none',
                                                                                    padding: '5px 10px',
                                                                                    borderRadius: '5px',
                                                                                    cursor: 'pointer',
                                                                                    fontSize: '12px',
                                                                                    marginBottom: '5px'
                                                                                }}
                                                                                onClick={() => {
                                                                                    console.log('Cancel button clicked for item:', item);
                                                                                    console.log('Item ID being passed:', item.id);
                                                                                    handleCancelOrder(item.id, order, item);
                                                                                }}
                                                                            >
                                                                                Cancel & Refund
                                                                            </button>
                                                                            <small style={{ color: '#666', fontSize: '10px' }}>
                                                                                {getRemainingCancelTime(order.created_at)}
                                                                            </small>
                                                                        </div>
                                                                    ) : (
                                                                        <div style={{ textAlign: 'center' }}>
                                                                            <span style={{
                                                                                backgroundColor: '#6c757d',
                                                                                color: 'white',
                                                                                padding: '5px 10px',
                                                                                borderRadius: '5px',
                                                                                fontSize: '12px'
                                                                            }}>
                                                                                Cannot Cancel
                                                                            </span>
                                                                            <small style={{ display: 'block', color: '#666', fontSize: '10px', marginTop: '2px' }}>
                                                                                {item.status?.toLowerCase() === 'delivered'
                                                                                    ? 'Order delivered'
                                                                                    : 'Cancellation period expired'
                                                                                }
                                                                            </small>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Review Section */}
                                                                <div style={{ marginTop: "1px", textAlign: 'center', minWidth: '150px' }}>
                                                                    {review ? (
                                                                        <div>
                                                                            <p style={{ margin: '5px 0', fontWeight: 'bold', fontSize: '0.9em' }}>Your Review:</p>
                                                                            <StarRating
                                                                                rating={review.rating}
                                                                                readOnly={true}
                                                                            />
                                                                            {review.review && (
                                                                                <p style={{
                                                                                    marginTop: '8px',
                                                                                    color: 'black',
                                                                                    fontSize: '0.85em',
                                                                                    fontStyle: 'italic',
                                                                                    padding: '8px',
                                                                                    backgroundColor: 'rgba(255,255,255,0.3)',
                                                                                    borderRadius: '5px'
                                                                                }}>
                                                                                    "{review.review}"
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <div>
                                                                            <StarRating
                                                                                rating={reviewInputs[`${order.order_id}_${item.id}`]?.rating || 0}
                                                                                onChange={(rating) =>
                                                                                    setReviewInputs(prev => ({
                                                                                        ...prev,
                                                                                        [`${order.order_id}_${item.id}`]: {
                                                                                            ...prev[`${order.order_id}_${item.id}`],
                                                                                            rating
                                                                                        }
                                                                                    }))
                                                                                }
                                                                                readOnly={false}
                                                                            />
                                                                            <button
                                                                                onClick={() => handleReviewSubmit(
                                                                                    order.order_id,
                                                                                    item.id,
                                                                                    reviewInputs[`${order.order_id}_${item.id}`]?.rating || 0,
                                                                                    reviewInputs[`${order.order_id}_${item.id}`]?.text || ''
                                                                                )}
                                                                                style={{
                                                                                    backgroundColor: '#28a745',
                                                                                    color: 'white',
                                                                                    border: 'none',
                                                                                    padding: '8px 16px',
                                                                                    borderRadius: '5px',
                                                                                    cursor: 'pointer',
                                                                                    fontSize: '0.85em',
                                                                                    width: '100%'
                                                                                }}
                                                                            >
                                                                                Submit Review
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {activeTab === 'refunds' && (
                    <div className="refund">
                        {refunds.length === 0 ? (
                            <p style={{ textAlign: 'center', padding: '16vw 0' }}>No refunds found</p>
                        ) : (
                            refunds.map((refund, index) => (
                                <div className="refund-details" key={refund.id || index} style={{
                                    backgroundColor: '#a9b1c0ff',
                                    padding: '20px',
                                    margin: '10px auto',
                                    width: '90%',
                                    borderRadius: '8px',
                                    border: '1px solid #dee2e6'
                                }}>
                                    <div style={{ minHeight: '7vw' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-evenly', flexWrap: 'wrap', gap: '10px' }}>
                                            <h4 style={{ color: '#333', margin: '5px 0' }}>
                                                Refund for: {refund.item_title}
                                            </h4>
                                            <p style={{ margin: '5px 0' }}><strong>Order ID:</strong> {refund.order_id}</p>
                                            <p style={{ margin: '5px 0' }}><strong>Refund ID:</strong> {refund.refund_id}</p>
                                            <p style={{ margin: '5px 0' }}><strong>Amount:</strong> ₹{refund.refund_amount}</p>
                                            <p style={{ margin: '5px 0' }}><strong>Reason:</strong> {refund.refund_reason}</p>
                                            <p style={{ margin: '5px 0' }}><strong>Date:</strong> {new Date(refund.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '15px', gap: '20px', flexWrap: 'wrap' }}>
                                            <span style={{
                                                backgroundColor: getStatusColor(refund.refund_status),
                                                color: 'white',
                                                padding: '5px 10px',
                                                borderRadius: '15px',
                                                fontSize: '0.9em',
                                                textTransform: 'capitalize'
                                            }}>
                                                {refund.refund_status}
                                            </span>
                                            <button
                                                onClick={() => checkRefundStatus(refund.refund_id)}
                                                style={{
                                                    backgroundColor: '#1a2a3bff',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '3px',
                                                    padding: '5px 15px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8em'
                                                }}
                                            >
                                                Check Status
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        );
    }

    export default Orders;
