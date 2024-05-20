import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faSeedling, faCow, faFish, faSquareMinus, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import Background from '../pictures/homepage_background.jpg';
import './Home.css';

export default function Home() {
    return (
        <div className="homepage-container">
            <div className="homepage-header">
                <img className="background" src={Background} alt="Homepage Background" />
                <div className='tagline-content'>
                    <h2 className="tagline"> From Farm to Table, Freshness Delivered: Your Online Grocery Destination </h2>
                </div>
            </div>

            <div className="category">
                <ul className="category-list">
                    <div>
                        <FontAwesomeIcon icon={faStar} />
                        <li>Staple</li>
                        <FontAwesomeIcon icon={faChevronDown} />
                    </div>
                    <div>
                        <FontAwesomeIcon icon={faSeedling} />
                        <li>Fruits and Vegetables</li>
                        <FontAwesomeIcon icon={faChevronDown} />
                    </div>
                    <div>
                        <FontAwesomeIcon icon={faCow} />
                        <li>Livestock</li>
                        <FontAwesomeIcon icon={faChevronDown} />
                    </div>
                    <div>
                        <FontAwesomeIcon icon={faFish} />
                        <li>Seafood</li>
                        <FontAwesomeIcon icon={faChevronDown} />
                    </div>
                    <div>
                        <FontAwesomeIcon icon={faSquareMinus} />
                        <li>Others</li>
                        <FontAwesomeIcon icon={faChevronDown} />
                    </div>
                </ul>
            </div>
        </div>
    );
}
