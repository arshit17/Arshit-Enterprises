import React from 'react';
import './AboutUs.css';
import OurStory from '../assets/Our_Story.png';
import { faUser, faRankingStar, faCircleCheck, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function aboutUs() {
    return (
        <div className='AboutUs'>
            <div className="name">
                <h1>About Us</h1>
            </div>
            <div className="welcome">
                <h1>Welcome to Arshit Enterprises</h1>
                <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Repellendus animi culpa esse necessitatibus nihil illum fugiat reprehenderit harum? Expedita dolorum vero veritatis repudiandae rerum totam voluptas voluptates sapiente laboriosam? Voluptatem earum qui mollitia, facilis corporis voluptate totam nostrum sed nisi, ipsum minus eaque impedit deserunt aperiam voluptatibus adipisci doloribus. Id repudiandae dolorem placeat sunt, quidem, rerum modi iure optio ipsum eum laborum, voluptatem perspiciatis quo debitis! Totam aperiam temporibus ex rem assumenda? Totam, ducimus commodi aliquid iste quod corporis dicta cum adipisci rerum optio aspernatur reiciendis magnam non inventore ab placeat. Beatae excepturi magnam est, impedit sequi eos eveniet possimus iure? Obcaecati et iure repudiandae eos. Adipisci illo molestiae ab alias possimus nostrum? Voluptatibus necessitatibus tempora aspernatur odio hic quae in sequi soluta rerum alias. Iusto rem, distinctio doloribus reiciendis repudiandae ducimus sint. Delectus quo dicta vel. Dignissimos explicabo officiis reprehenderit vero consequatur, aliquam cumque impedit tempora aliquid nobis repudiandae quibusdam reiciendis, nesciunt molestiae accusamus mollitia dolorem fugiat temporibus, qui commodi ut sint facere corporis debitis. Distinctio enim ducimus, est iste eligendi cumque vero laboriosam fuga, ullam molestiae mollitia obcaecati accusantium? Praesentium sunt maiores odio nesciunt sint non quasi qui ipsum iure. Commodi, magni expedita repudiandae cumque voluptate quam dolorem!</p>
            </div>
            <div className="story">
                <div className="storyimg"><img src={OurStory} alt="" /></div>
                <div className="storyPara">
                    <h1>Our Story</h1>
                    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Velit voluptatibus, modi maiores ipsam quaerat odit ab aut odio fuga veniam vel unde blanditiis nulla, dolorem at quidem perferendis? Nulla quo a nostrum, fugit error consequatur quia explicabo quaerat dolore praesentium voluptatibus architecto enim in qui fuga saepe aut distinctio quidem, voluptatum rem eligendi. Fugit, at perferendis? Natus, dolores? Autem natus a ipsum cum ratione corporis, sed dolorum sequi quisquam recusandae, quis perferendis. Vitae ut consequuntur, facilis blanditiis tempora quidem nam dolorem minus nostrum harum cum saepe, recusandae in deserunt voluptates esse maiores ratione cumque molestias at impedit quos, natus distinctio.</p>
                </div>
            </div>
            <div className="values">
                <h1>Our Values</h1>
                <div>
                    <FontAwesomeIcon icon={faRankingStar} style={{ color: '#fff' }}/>
                    <h4>Quality</h4>
                </div>
                <div>
                    <FontAwesomeIcon icon={faCircleCheck} style={{ color: '#fff' }} />
                    <h4>Integrity</h4>
                </div>
                <div>
                    <FontAwesomeIcon icon={faUser} style={{ color: '#fff' }} />
                    <h4>Customer Satisfaction</h4>
                </div>
            </div>

        </div>
    );
};

export default aboutUs;