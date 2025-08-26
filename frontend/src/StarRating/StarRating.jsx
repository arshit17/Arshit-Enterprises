import React, { useState } from 'react';
import './StarRating.css';

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
                marginBottom: '10px' 
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
                        fontSize: '1.5em',
                        userSelect: 'none',
                        transition: 'color 0.2s ease'
                    }}
                >
                    ★
                </span>
            ))}
            <span style={{ 
                marginLeft: '10px', 
                fontSize: '0.9em', 
                color: '#666' 
            }}>
                {rating > 0 ? `${rating}/5` : readOnly ? 'No rating' : 'Click to rate'}
            </span>
        </div>
    );
};

// Demo component to show how it works
const StarRatingDemo = () => {
    const [userRating, setUserRating] = useState(0);
    const [submittedRating, setSubmittedRating] = useState(0);

    const handleRatingChange = (newRating) => {
        setUserRating(newRating);
        console.log('Rating changed to:', newRating);
    };

    const handleSubmit = () => {
        setSubmittedRating(userRating);
        alert(`Rating submitted: ${userRating} stars`);
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h3>Star Rating Component Demo</h3>
            
            <div style={{ marginBottom: '30px' }}>
                <h4>Interactive Rating (not read-only):</h4>
                <StarRating 
                    rating={userRating} 
                    onChange={handleRatingChange} 
                    readOnly={false} 
                />
                <button 
                    onClick={handleSubmit}
                    style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginTop: '10px'
                    }}
                >
                    Submit Rating
                </button>
            </div>

            {submittedRating > 0 && (
                <div>
                    <h4>Read-only Rating Display:</h4>
                    <StarRating 
                        rating={submittedRating} 
                        readOnly={true} 
                    />
                </div>
            )}
        </div>
    );
};

export default StarRatingDemo;