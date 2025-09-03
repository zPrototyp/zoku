import React from 'react';

const BrandCard = ({ brand }) => {
  const {
    name,
    category,
    shortDescription,
    imageUrl,
    url,
    isActive,
    targetAgeMin,
    targetAgeMax,
    priceSegment,
    brandPersonality,
    sharesByPlatform,
    totalUsersLikes,
    totalUsersUnlikes,
    interactionCount,
  } = brand;

  const renderPersonality = () =>
    Object.entries(brandPersonality).map(([key, value]) => (
      <div className="personality-item" key={key}>
        <div className="personality-label">{formatKey(key)}</div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${value}%` }} />
        </div>
        <div className="personality-value">{value}%</div>
      </div>
    ));

  const formatKey = (key) =>
    key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

  return (
    <div className={`brand-card ${!isActive ? 'inactive' : ''}`}>
      {imageUrl && <img src={imageUrl} alt={name} className="brand-image" />}

      <div className="brand-header">
        <h2>{name} ({category})</h2>
        <p className="brand-description">{shortDescription}</p>
        {url && <a href={url} target="_blank" rel="noopener noreferrer">Visit Website</a>}
      </div>


      <div className="brand-personality">
        <h4>Brand Personality</h4>
        {renderPersonality()}
      </div>

      <div className="brand-stats">
        <h4>Engagement</h4>
        <p><strong>Likes:</strong> {totalUsersLikes}</p>
        <p><strong>Unlikes:</strong> {totalUsersUnlikes}</p>
        <p><strong>Interactions:</strong> {interactionCount}</p>
        <p><strong>Shares:</strong> {Object.entries(sharesByPlatform).map(
          ([platform, count]) => `${platform}: ${count} `
        )}</p>
      </div>
    </div>
  );
};
export default BrandCard;