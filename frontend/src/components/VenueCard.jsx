import React from 'react';
import { useNavigate } from 'react-router-dom';
import './VenueCard.css';

const sportIcons = {
  badminton: '🏸',
  football: '⚽',
  cricket: '🏏',
  'table tennis': '🏓',
  basketball: '🏀',
  tennis: '🎾',
};

const VenueCard = ({ venue }) => {
  const navigate = useNavigate();
  return (
    <div className="venue-card enhanced">
      <div className="accent-bar" style={{ background: '#43e97b' }} />
      <div className="venue-image">
        {venue.image ? (
          <img src={venue.image} alt={venue.name} />
        ) : (
          <div className="venue-image-placeholder">
            <span style={{ fontSize: '2.5rem' }}>{sportIcons[venue.sport] || '🏟️'}</span>
          </div>
        )}
      </div>
      <div className="venue-info">
        <div className="venue-header">
          <h3>{venue.name}</h3>
          <span className="venue-rating-badge">
            <span className="star">★</span> {venue.rating}
            <span className="venue-reviews">({venue.reviews})</span>
          </span>
        </div>
        <div className="venue-location">
          <span className="location-icon">📍</span> {venue.location}
        </div>
        <div className="venue-price">₹ <span className="price-value">{venue.price}</span> <span className="per-hour">/ hour</span></div>
        <div className="venue-tags">
          <span className="venue-badge sport">{sportIcons[venue.sport] || '🏟️'} {venue.sport}</span>
          <span className="venue-badge type">{venue.type === 'Indoor' ? '🏠 Indoor' : '🌞 Outdoor'}</span>
          {venue.tags.map(tag => (
            <span className="venue-badge tag" key={tag}>{tag}</span>
          ))}
        </div>
        <button className="venue-details-btn" onClick={() => navigate(`/venues/${venue.id}`)}>View Details</button>
      </div>
    </div>
  );
};

export default VenueCard;
