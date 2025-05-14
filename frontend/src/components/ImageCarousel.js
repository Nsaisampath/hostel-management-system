import React, { useState,useEffect,useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

import image1 from '../assets/gallery1.jpg'; // Import images
import image2 from '../assets/gallery2.jpg';
import image3 from '../assets/gallery3.jpg';
import image4 from '../assets/gallery4.jpg';

const ImageCarousel = () => {
  // Array of images
  const images = [image1, image2, image3, image4];

  // State to track the current image index
  const [currentIndex, setCurrentIndex] = useState(0);

  // Function to go to the next image
  const nextImage = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  // Function to go to the previous image
  const prevImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // Auto-slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(nextImage, 3000);
    return () => clearInterval(interval);
     // Cleanup interval on unmount
  }, [nextImage]);

  return (
    <div className="carousel">
      <div className="carousel-container">
        {/* Left Arrow */}
        <button onClick={prevImage} className="carousel-arrow left-arrow">
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>

        {/* Image */}
        <img
          src={images[currentIndex]}
          alt={`Gallery item ${currentIndex + 1}`}
          className="carousel-image"
        />

        {/* Right Arrow */}
        <button onClick={nextImage} className="carousel-arrow right-arrow">
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>
    </div>
  );
};

export default ImageCarousel;
