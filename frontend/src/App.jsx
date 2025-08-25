import Navbar from './Navbar/.jsx';
import Body from './Body/Body.jsx'
import Footer from './Footer/Footer.jsx';
import ProductCategoryPage from './products/ProductPageCategory.jsx';
import Aboutus from './AboutUs/Aboutus.jsx';
import ContactUs from './contactus/ContactUs.jsx';
import Login from './Login/Login.jsx';
import AddItem from './AddItem/AddItem.jsx';
import Cart from './Cart/Cart.jsx';
import Checkout from './checkout/checkout.jsx';
import Orders from './Orders/Orders.jsx';
import Forgot from './forgot/Forgot.jsx';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'

function App() {

  return (
    <>
      
      <Router>
        <Routes>
          <Route path='/' element={<><Navbar /><Body /><Footer /></>} key="home"></Route>
          <Route path='/products/:category' element={<><Navbar /><ProductCategoryPage/><Footer /></>} key="product-category"></Route>
          <Route path='/aboutus' element={<><Navbar/><Aboutus/><Footer/></>} key="about-us"></Route>
          <Route path='/orders' element={<><Navbar/><Orders/><Footer/></>} key="orders"></Route>
          <Route path='/cartItem' element={<><Navbar /><Cart /><Footer /></>} key="cart"></Route>
          <Route path='/checkout' element={<Checkout />} key="checkout"></Route>
          <Route path='/contactus' element={<><Navbar /><ContactUs /></>} key="contact-us"></Route>
          <Route path='/signup' element={<Login />} key="signup"></Route>
          <Route path='/forgot-password' element={<Forgot />} key="forgot-password"></Route>
          <Route path='/AddItem' element={<><Navbar/><AddItem /></>} key="add-item"></Route>
        </Routes>
      </Router>
    </>
  )
}

export default App
