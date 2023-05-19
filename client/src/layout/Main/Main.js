import React, { useState } from 'react';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import './main.css';
import Router from '../../routers';
import RatingPage from '../../page/RatingPage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleLeft } from '@fortawesome/free-solid-svg-icons';

export default function Main() {
  const [showRatingPage, setShowRatingPage] = useState(false);

  const handleShowRatingPage = () => {
    setShowRatingPage(!showRatingPage);
  };

  return (
    <div className='page-container'>
      <Header></Header>
      <div className='content-wrap'>
        <div className='router-container'>
          <Router />
          {showRatingPage && (
            <div className='rating-content'>
              <RatingPage />
            </div>
          )}
        </div>
        <button className="rating-icon" onClick={handleShowRatingPage}>
          <FontAwesomeIcon icon={faArrowAltCircleLeft} />
        </button>
      </div>
      <Footer></Footer>
    </div>
  );
}
