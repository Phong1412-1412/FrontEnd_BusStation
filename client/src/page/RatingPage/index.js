import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';
import { useAuth } from '../../contexts/auth';
import { message } from 'antd';

function RatingPage() {
  const [ratings, setRatings] = useState([]);
  const [userRating, setUserRating] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [userReview, setUserReview] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false); 
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRatings = () => {
      axios
        .get(`http://localhost:9999/api/v1/ratings?page=${currentPage}`)
        .then(response => {
          const { data } = response;
          setRatings(data.content);
          setTotalPages(data.totalPages);
          if (currentPage === 0) {
            const userReview = data.content.find(rating => rating.user.userId === user?.user.userId);
            setUserReview(userReview);
            setUserRating(userReview?.content || '');
            setHoverRating(userReview?.rating || 0);
          }
        })
        .catch(error => console.log(error));
    };
  
    fetchRatings();
  }, [user, currentPage]);
  

  const goToPage = page => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    alert(userReview)
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 0; i < totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={currentPage === i ? 'active' : ''}
        >
          {i + 1}
        </button>
      );
    }
    return (
      <div className="pagination">
        <button onClick={goToPreviousPage} disabled={currentPage === 0}>
          Previous
        </button>
        {pages}
        <button onClick={goToNextPage} disabled={currentPage === totalPages - 1}>
          Next
        </button>
      </div>
    );
  };

  const renderRating = (rating) => {
    const roundedRating = Math.round(rating.rating);
    const stars = [];

    for (let i = 0; i < roundedRating; i++) {
      stars.push(<span key={i} className="star-filled" />);
    }

    for (let i = roundedRating; i < 5; i++) {
      stars.push(<span key={i} className="star-empty" />);
    }

    return (
      <div className="rating" key={rating.ratingId}>
        <p className="fullname">{rating.user.fullName}</p>
        <div className="star-rating">{stars}</div>
        <p className="content">{rating.content}</p>
        <p className="created-at">{rating.createdAt}</p>
        <hr />
      </div>
    );
  };

  const handleHoverRating = (rating) => {
    if (!isEditMode && userRating === '') {
      setHoverRating(rating);
    }
  };

  const handleRatingChange = (rating) => {
    if (isEditMode) {
      setHoverRating(rating);
    }
  };

  const handleContentChange = (event) => {
    setUserRating(event.target.value);
  };

  const submitRating = () => {
    const newRating = {
      rating: hoverRating,
      content: userRating
    };

    axios.post('http://localhost:9999/api/v1/ratings', newRating)
      .then(response => {
        setRatings([...ratings, response.data]);
        setUserRating(response.data.content);
        setHoverRating(response.data.rating);
        setIsEditMode(false);
        const userReview = ratings.map(rating => {
          if (rating.ratingId === response.data.ratingId) {
            return response.data;
          }
          return rating;
        });
        setUserReview(userReview);
        message.success('Rating submitted successfully.');
      })
      .catch(error => {
        if(hoverRating === 0){
          setHoverRating(5);
          message.error('Failed to submit rating. Please hover rating.');
          return;
        }
        message.error('Failed to submit rating. Please try again.');
      });
  };

  const saveRating =()=>{
    const updatedRating = {
      rating: hoverRating,
      content: userRating
    };
    axios.put(`http://localhost:9999/api/v1/ratings`, updatedRating)
    .then(response => {
      const updatedRatings = ratings.map(rating => {
        if (rating.ratingId === userReview.ratingId) {
          return response.data;
        }
        return rating;
      });
      setRatings(updatedRatings);
      setUserRating(response.data.content);
      setHoverRating(response.data.rating);
      setIsEditMode(false);      
      message.success('Rating updated successfully.');
    })
    .catch(error => {
      console.log(error)
      message.error('Failed to update rating. Please try again.');
    });
  }

  const updateRating = () => {
    setIsEditMode(true);
  };

  const deleteRating = () => {
    axios.delete(`http://localhost:9999/api/v1/ratings`)
      .then(response => {
        setUserRating('');
        setHoverRating(0);
        setIsEditMode(false);
        setUserReview(null);
        const updatedRatings = ratings.filter(rating => rating.ratingId !== userReview.ratingId);
        setRatings(updatedRatings);
        message.success('Rating deleted successfully.');
      })
      .catch(error => {
        console.log(error);
        message.error('Failed to delete rating. Please try again.');
      });
  };

  return (
    <div className="container-rating">
      {ratings.map(rating => renderRating(rating))}
      {renderPagination()}

      {userReview ? (
        <div className="rating-form">
          <h2>{user?.user.fullName}</h2>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((rating) => (
              <span
                key={rating}
                className={rating <= hoverRating ? 'star-filled' : 'star-empty'}
                onMouseEnter={() => handleHoverRating(rating)}
                onMouseLeave={() => handleHoverRating(rating)}
                onClick={() => handleRatingChange(rating)}
              />
            ))}
          </div>
          <textarea
            className="rating-input"
            placeholder="Enter content rating..."
            value={userRating}
            onChange={handleContentChange}
            disabled={!isEditMode} 
          />
          {isEditMode ? (
            <div>
              <button className="submit-btn" onClick={saveRating}>Save</button>
            </div>
          ) : (
            <div>
              <button className="update-btn" onClick={updateRating}>Update</button>
              <button className="delete-btn" onClick={deleteRating}>Delete</button>
            </div>
          )}
        </div>
      ) : user ? (
        <div className="rating-form">
          <h2>{user?.user.fullName}</h2>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((rating) => (
              <span
                key={rating}
                className={rating <= hoverRating ? 'star-filled' : 'star-empty'}
                onMouseEnter={() => handleHoverRating(rating)}
                onMouseLeave={() => handleHoverRating(rating)}
                onClick={() => handleRatingChange(rating)}
              />
            ))}
          </div>
          <textarea
            className="rating-input"
            placeholder="Enter content rating..."
            value={userRating}
            onChange={handleContentChange}
          />
          <button className="submit-btn" onClick={submitRating}>Send</button>
        </div>
      ) : (
        <p>Please log in to rating.</p>
      )}
    </div>
  );
}

export default RatingPage;
