import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  RadialLinearScale,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Radar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  RadialLinearScale,
  ArcElement
);

const API_BASE_URL = 'http://localhost:8000';

const PlayerProfile = ({ playerId, onClose }) => {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchPlayerProfile();
  }, [playerId]);

  const fetchPlayerProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/player/${playerId}`);
      if (response.data.success) {
        setPlayer(response.data);
      }
    } catch (err) {
      setError('Failed to fetch player profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderHeatMap = () => {
    if (!player?.heat_map_data) return null;

    const { grid, max_value, min_value } = player.heat_map_data;
    const cellSize = 30;

    return (
      <div className="heat-map-container">
        <h3>Field Activity Heat Map</h3>
        <div className="heat-map" style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '1px' }}>
          {grid.map((row, i) =>
            row.map((value, j) => {
              const intensity = ((value - min_value) / (max_value - min_value)) * 100;
              const backgroundColor = `rgba(255, 0, 0, ${intensity / 100})`;
              
              return (
                <div
                  key={`${i}-${j}`}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor,
                    border: '1px solid #ccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '8px',
                    color: intensity > 50 ? 'white' : 'black'
                  }}
                  title={`Position (${i}, ${j}): ${value}`}
                >
                  {Math.round(value)}
                </div>
              );
            })
          )}
        </div>
        <div className="heat-map-legend">
          <span>Low Activity</span>
          <div className="legend-gradient"></div>
          <span>High Activity</span>
        </div>
      </div>
    );
  };

  const renderPerformanceTrends = () => {
    if (!player?.performance_trends) return null;

    const { matches, goals, assists, rating, minutes } = player.performance_trends;

    const goalsData = {
      labels: matches.map(m => new Date(m).toLocaleDateString()),
      datasets: [
        {
          label: 'Goals',
          data: goals,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.1
        }
      ]
    };

    const assistsData = {
      labels: matches.map(m => new Date(m).toLocaleDateString()),
      datasets: [
        {
          label: 'Assists',
          data: assists,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          tension: 0.1
        }
      ]
    };

    const ratingData = {
      labels: matches.map(m => new Date(m).toLocaleDateString()),
      datasets: [
        {
          label: 'Match Rating',
          data: rating,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1
        }
      ]
    };

    return (
      <div className="performance-trends">
        <h3>Performance Trends (Last 10 Matches)</h3>
        <div className="charts-grid">
          <div className="chart-container">
            <h4>Goals per Match</h4>
            <Line data={goalsData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
          <div className="chart-container">
            <h4>Assists per Match</h4>
            <Line data={assistsData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
          <div className="chart-container">
            <h4>Match Ratings</h4>
            <Line data={ratingData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    );
  };

  const renderStatistics = () => {
    if (!player?.statistics) return null;

    const stats = player.statistics;
    const keyStats = [
      { label: 'Appearances', value: stats.appearances },
      { label: 'Minutes Played', value: stats.minutes_played },
      { label: 'Goals', value: stats.goals },
      { label: 'Assists', value: stats.assists },
      { label: 'Goals per 90', value: stats.goals_per_90?.toFixed(2) },
      { label: 'Assists per 90', value: stats.assists_per_90?.toFixed(2) },
      { label: 'Pass Accuracy', value: `${stats.pass_accuracy?.toFixed(1)}%` },
      { label: 'Shots', value: stats.shots },
      { label: 'Shots on Target', value: stats.shots_on_target },
      { label: 'Shot Accuracy', value: `${stats.shot_accuracy?.toFixed(1)}%` },
      { label: 'Tackles', value: stats.tackles },
      { label: 'Interceptions', value: stats.interceptions },
      { label: 'Yellow Cards', value: stats.yellow_cards },
      { label: 'Red Cards', value: stats.red_cards },
      { label: 'Clean Sheets', value: stats.clean_sheets },
    ];

    // Create radar chart data for key performance indicators
    const radarData = {
      labels: ['Goals', 'Assists', 'Pass Accuracy', 'Tackles', 'Minutes', 'Rating'],
      datasets: [
        {
          label: 'Performance',
          data: [
            Math.min(stats.goals * 10, 100),
            Math.min(stats.assists * 15, 100),
            stats.pass_accuracy || 0,
            Math.min(stats.tackles * 2, 100),
            Math.min((stats.minutes_played / 2500) * 100, 100),
            75 // Average rating
          ],
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 2,
        }
      ]
    };

    return (
      <div className="statistics-section">
        <h3>Season Statistics</h3>
        <div className="stats-grid">
          <div className="stats-cards">
            {keyStats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="radar-chart">
            <h4>Performance Radar</h4>
            <Radar data={radarData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="loading">Loading player profile...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="error">
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={fetchPlayerProfile}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  if (!player) return null;

  const { player: playerInfo, statistics } = player;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content player-profile-modal" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        <div className="player-header">
          <div className="player-info">
            <h2>{playerInfo.name}</h2>
            <div className="player-details">
              <span className="position">{playerInfo.position}</span>
              <span className="team">{playerInfo.currentTeam}</span>
              <span className="age">{playerInfo.age} years old</span>
              <span className="nationality">{playerInfo.nationality}</span>
            </div>
          </div>
        </div>

        <nav className="player-tabs">
          <button 
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={activeTab === 'statistics' ? 'active' : ''}
            onClick={() => setActiveTab('statistics')}
          >
            Statistics
          </button>
          <button 
            className={activeTab === 'trends' ? 'active' : ''}
            onClick={() => setActiveTab('trends')}
          >
            Performance Trends
          </button>
          <button 
            className={activeTab === 'heatmap' ? 'active' : ''}
            onClick={() => setActiveTab('heatmap')}
          >
            Heat Map
          </button>
        </nav>

        <div className="player-content">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <div className="overview-stats">
                <div className="stat-highlight">
                  <div className="stat-number">{statistics.goals}</div>
                  <div className="stat-label">Goals</div>
                </div>
                <div className="stat-highlight">
                  <div className="stat-number">{statistics.assists}</div>
                  <div className="stat-label">Assists</div>
                </div>
                <div className="stat-highlight">
                  <div className="stat-number">{statistics.appearances}</div>
                  <div className="stat-label">Appearances</div>
                </div>
                <div className="stat-highlight">
                  <div className="stat-number">{statistics.minutes_played}</div>
                  <div className="stat-label">Minutes</div>
                </div>
              </div>
              {renderStatistics()}
            </div>
          )}

          {activeTab === 'statistics' && renderStatistics()}
          {activeTab === 'trends' && renderPerformanceTrends()}
          {activeTab === 'heatmap' && renderHeatMap()}
        </div>
      </div>
    </div>
  );
};

export default PlayerProfile; 