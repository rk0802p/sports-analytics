import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE_URL = 'http://localhost:8000';

const LeagueLeaders = ({ onClose }) => {
  const [leagueLeaders, setLeagueLeaders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('goals');

  useEffect(() => {
    fetchLeagueLeaders();
  }, []);

  const fetchLeagueLeaders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/players/statistics/league-leaders`);
      if (response.data.success) {
        setLeagueLeaders(response.data.league_leaders);
      }
    } catch (err) {
      setError('Failed to fetch league leaders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderLeaderboard = (category, players) => {
    if (!players || players.length === 0) return null;

    const chartData = {
      labels: players.map(p => p.name),
      datasets: [
        {
          label: category.charAt(0).toUpperCase() + category.slice(1),
          data: players.map(p => p.statistics?.[category] || 0),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1,
        }
      ]
    };

    return (
      <div className="leaderboard-section">
        <div className="leaderboard-table">
          <h3>Top 5 - {category.charAt(0).toUpperCase() + category.slice(1)}</h3>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Team</th>
                <th>Position</th>
                <th>{category.charAt(0).toUpperCase() + category.slice(1)}</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr key={player.id} className={index < 3 ? `rank-${index + 1}` : ''}>
                  <td className="rank">{index + 1}</td>
                  <td className="player-name">{player.name}</td>
                  <td className="team">{player.statistics?.team || 'Unknown'}</td>
                  <td className="position">{player.position}</td>
                  <td className="stat-value">
                    {category === 'pass_accuracy' 
                      ? `${player.statistics?.[category]?.toFixed(1)}%`
                      : player.statistics?.[category] || 0
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="leaderboard-chart">
          <Bar 
            data={chartData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                title: {
                  display: true,
                  text: `League Leaders - ${category.charAt(0).toUpperCase() + category.slice(1)}`
                }
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }}
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="loading">Loading league leaders...</div>
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
            <button onClick={fetchLeagueLeaders}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  if (!leagueLeaders) return null;

  const categories = [
    { key: 'goals', label: 'Goals' },
    { key: 'assists', label: 'Assists' },
    { key: 'clean_sheets', label: 'Clean Sheets' },
    { key: 'pass_accuracy', label: 'Pass Accuracy' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content league-leaders-modal" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        <div className="leaders-header">
          <h2>🏆 League Leaders</h2>
          <p>Top performers in Premier League statistical categories</p>
        </div>

        <nav className="category-tabs">
          {categories.map(category => (
            <button 
              key={category.key}
              className={activeCategory === category.key ? 'active' : ''}
              onClick={() => setActiveCategory(category.key)}
            >
              {category.label}
            </button>
          ))}
        </nav>

        <div className="leaders-content">
          {renderLeaderboard(activeCategory, leagueLeaders[activeCategory])}
        </div>
      </div>
    </div>
  );
};

export default LeagueLeaders; 