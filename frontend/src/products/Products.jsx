import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom'
import "./Products.css"
import { jwtDecode } from 'jwt-decode';

function Products({searchQuery, setSearchQuery}) {
    const { category } = useParams();
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

    const categories = [
        { label: 'Wiring Items', id: 'WiringItems' },
        { label: 'Home Appliances', id: 'HomeAppliances' },
        { label: 'Tools', id: 'Tools' },
        { label: 'Lightings', id: 'Lightings' },
        { label: 'Sanitary Items', id: 'SanitaryItems' },
    ];

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    return (
        <div id='product'>
            <div className='searchBar'>
                <h1>Products</h1>
                <div className="search-controls">
                    <input 
                        type="text" 
                        value={searchQuery} 
                        onChange={handleSearchChange}
                        className="search-input"
                        placeholder='Search Products...' 
                    />
                    {searchQuery && (
                        <button 
                            onClick={handleClearSearch} 
                            className="clear-button"
                        >
                            Clear
                        </button>
                    )}
                    <span className="button-spacer"></span>
                    {userEmail === 'mittalarshit56@gmail.com' && (
                        <Link to='/AddItem'><button className="add-button">Add</button></Link>
                    )}
                </div>
            </div>
            <div className="itemBar">
                {categories.map((cat) => (
                    <Link key={cat.id} to={`/products/${cat.id}`} style={{ textDecoration: "none" }}>
                        <div 
                            id={cat.id} 
                            className={`category-item ${category === cat.id ? 'active' : ''}`}
                        >
                            <h3>{cat.label}</h3>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Products;
