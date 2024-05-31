import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faSeedling, faCow, faFish, faSquareMinus } from '@fortawesome/free-solid-svg-icons';
import Background from '../pictures/homepage_background.jpg';
import { useState, useEffect } from 'react';
import './Home.css';

export default function Home() {
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
      setIsActive(true);
    }, []);

    return (
        <div className={`fade-in-out ${isActive ? "active" : ""}`}>
        <div className="homepage-container">
            <div className="homepage-header">
                <img className="background" src={Background} alt="Homepage Background" />
                <div className='tagline-content'>
                    <h2 className="tagline"> From Farm to Table, Freshness Delivered: </h2>
                    <h2 className="tagline2">Your Online Grocery Destination </h2>
                </div>
            </div>

            <div className="category">
                <ul className="category-list">
                    <div>
                        <FontAwesomeIcon icon={faStar} />
                        <li>Staple</li>
                    </div>
                    <div>
                        <FontAwesomeIcon icon={faSeedling} />
                        <li>Fruits and Vegetables</li>
                    </div>
                    <div>
                        <FontAwesomeIcon icon={faCow} />
                        <li>Livestock</li>
                    </div>
                    <div>
                        <FontAwesomeIcon icon={faFish} />
                        <li>Seafood</li>
                    </div>
                    <div>
                        <FontAwesomeIcon icon={faSquareMinus} />
                        <li>Others</li>
                    </div>
                </ul>
            </div>
        </div>
        </div>
    );
}
