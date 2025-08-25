import React, { useState } from 'react';
import './AddItem.css';
import axios from 'axios';

function AddItem() {

    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [shipping, setShipping] = useState('');
    const [image, setImage] = useState('');
    const [category, setCategory] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('price', price);
        formData.append('quantity', quantity);
        formData.append('shipping', shipping);
        formData.append('category', category);
        formData.append('image', image);
        try {
            await axios.post('http://localhost:5500/additem', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
                .then(res => console.log(res.data))
                .catch(err => console.error("Error submitting form:", err));
            alert("Data submitted successfully");
            setTitle('');
            setPrice('');
            setCategory('');
            setQuantity('');
            setShipping('');
            setImage('');
        } catch (error) {
            console.log('Error submitting form:', error);
            alert('Error submitting data.');
        }
    }

    return (
        <div className='AddItem'>
            <form className='AddItemForm' onSubmit={handleSubmit} method='POST'>
                <h1 className="form-title">Add Item</h1>
                <br />
                <label htmlFor="title" className="form-label">Title</label>
                <br />
                <input type="text" id='title' name='title' placeholder='Add your item title...' className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
                <br />
                <label htmlFor="price" className="form-label">Price</label>
                <br />
                <input type="number" id='price' name='price' min="0" placeholder='Add your item price...' className="form-input" value={price} onChange={(e) => setPrice(e.target.value)} required />
                <br />
                <label htmlFor="quantity" className="form-label">Quantity</label>
                <br />
                <input type="number" id='quantity' name='quantity' min="0" placeholder='Add your item quantity...' className="form-input" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
                <br />
                <label htmlFor="shipping" className="form-label">Shipping Charge</label>
                <br />
                <input type="number" id='shipping' name='shipping' min="0" placeholder='Add your item Shipping Charge...' className="form-input" value={shipping} onChange={(e) => setShipping(e.target.value)} required />
                <br />
                <label htmlFor="image" className="form-label">Image</label>
                <br />
                <input type="file" accept='image/*' id='image' name='image' className="form-input" onChange={(e) => setImage(e.target.files[0])} />
                <br />
                <label htmlFor="category" className="form-label">Category</label>
                <br />
                <select id="category" name="category" className="form-select" value={category} onChange={(e) => setCategory(e.target.value)} required>
                    <option value="">Select Item Category...</option>
                    <option value="Wiring items">Wiring Items</option>
                    <option value="Home Appliances">Home Appliances</option>
                    <option value="Tools">Tools</option>
                    <option value="Lightings">Lightings</option>
                    <option value="Sanitary Item">Sanitary Items</option>
                </select>
                <br />
                <button type='submit' className="form-button">Add Item</button>
            </form>
        </div>
    );
};

export default AddItem;
