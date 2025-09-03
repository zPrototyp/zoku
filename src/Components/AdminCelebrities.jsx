import React from 'react';
import "../assets/css/Admin.css";

const CelebrityDashboard = ({ data }) => {
  const {
    totalCelebrities,
    activeCelebrities,
    totalInteractions,
    uniqueUsers,
    mostPopular,
    celebritiesByCategory,
  } = data;

  return (
    <div className="admincelebrity-dashboard">
      {/* Summary Section */}
      <div className="summary-section">
        <SummaryCard title="Total Celebrities" value={totalCelebrities} />
        <SummaryCard title="Active Celebrities" value={activeCelebrities} />
        <SummaryCard title="Total Interactions" value={totalInteractions} />
        <SummaryCard title="Unique Users" value={uniqueUsers} />
      </div>

      {/* Most Popular Section */}
      <div className="section">
        <h3>Most Popular Celebrities</h3>
        <div className="popular-list">
          {mostPopular.map((celeb) => (
            <div className="adminceleb-card" key={celeb.id}>
              <h4>{celeb.name}</h4>
              <p className="category">{celeb.category}</p>
              <div className="metrics">
                <span>👍Likes: {celeb.likeCount}</span>
                <span>💬 Interactions: {celeb.interactionCount}</span>
                <span>⭐ Popularity: {celeb.popularityScore}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Distribution */}
      <div className="section">
        <h3>Celebrities by Category</h3>
        <ul className="category-list">
          {Object.entries(celebritiesByCategory).map(([category, count]) => (
            <li key={category}>
              <strong>{category}:</strong> {count}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value }) => (
  <div className="summary-card">
    <h4>{title}</h4>
    <p>{value}</p>
  </div>
);

export default CelebrityDashboard;
