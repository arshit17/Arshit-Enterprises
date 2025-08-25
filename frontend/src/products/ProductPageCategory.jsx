import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Products from './Products';
import Wiringitem from './category/Wiringitem';
import Homeappliances from './category/Homeappliances';
import Tools from './category/Tools'
import Lighting from './category/Lighting'
import Sanitaryitems from './category/Sanitaryitems';

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