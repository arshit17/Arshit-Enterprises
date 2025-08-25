import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Products from './Products.jsx';
import Wiringitem from './category/Wiringitem.jsx';
import Homeappliances from './category/Homeappliances.jsx';
import Tools from './category/Tools.jsx'
import Lighting from './category/Lighting.jsx'
import Sanitaryitems from './category/Sanitaryitems.jsx';

function ProductCategoryPage() {
    const { category } = useParams();
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <>
            <Products searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            {category === 'WiringItems' && <Wiringitem searchQuery={searchQuery}/>}
            {category === 'HomeAppliances' && <Homeappliances searchQuery={searchQuery}/>}
            {category === 'Tools' && <Tools searchQuery={searchQuery}/>}
            {category === 'Lightings' && <Lighting searchQuery={searchQuery}/>}
            {category === 'SanitaryItems' && <Sanitaryitems searchQuery={searchQuery}/>}
        </>
    );
}

export default ProductCategoryPage; 