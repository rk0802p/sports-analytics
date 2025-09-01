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
  RadialLinearScale,
  ArcElement,
} from 'chart.js';
import { Bar, Radar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  ArcElement
);

const API_BASE_URL = 'http://localhost:8000';

const PlayerComparison = ({ onClose }) => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      fetchTeamPlayers(selectedTeam);
    }
  }, [selectedTeam]);

  useEffect(() => {
    if (selectedPlayers.length >= 2) {
      comparePlayers();
    }
  }, [selectedPlayers]);

  const fetchTeams = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/teams`);
      if (response.data.success) {
        setTeams(response.data.teams);
      }
    } catch (err) {
      setError('Failed to fetch teams');
      console.error(err);
    }
  };

  const fetchTeamPlayers = async (teamId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/team/${teamId}/players`);
      if (response.data.success) {
        setTeamPlayers(response.data.players);
      }
    } catch (err) {
      setError('Failed to fetch team players');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const comparePlayers = async () => {
    try {
      setLoading(true);
      const playerIds = selectedPlayers.map(p => p.id).join(',');
      const response = await axios.get(`${API_BASE_URL}/players/compare?player_ids=${playerIds}`);
      if (response.data.success) {
        setComparisonData(response.data);
      }
    } catch (err) {
      setError('Failed to compare players');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerSelect = (player) => {
    if (selectedPlayers.find(p => p.id === player.id)) {
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
    } else if (selectedPlayers.length < 4) {
      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  const renderComparisonCharts = () => {
    if (!comparisonData) return null;

    const { players, comparison_metrics } = comparisonData;
    const { metrics, players: playerMetrics } = comparison_metrics;

    // Create bar chart data for comparison
    const barData = {
      labels: metrics,
      datasets: playerMetrics.map((player, index) => ({
        label: player.name,
        data: metrics.map(metric => player.values[metric]),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ][index],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
        ][index],
        borderWidth: 1,
      }))
    };

    // Create radar chart data for each player
    const radarData = {
      labels: ['Goals', 'Assists', 'Pass Accuracy', 'Tackles', 'Minutes', 'Shots'],
      datasets: playerMetrics.map((player, index) => ({
        label: player.name,
        data: [
          player.values.goals,
          player.values.assists,
          player.values.pass_accuracy,
          player.values.tackles,
          player.values.minutes_played / 100, // Normalize
          player.values.shots,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 205, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
        ][index],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
        ][index],
        borderWidth: 2,
      }))
    };

    return (
      <div className="comparison-charts">
        <div className="chart-container">
          <h3>Statistical Comparison</h3>
          <Bar 
            data={barData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Player Statistics Comparison'
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
        
        <div className="chart-container">
          <h3>Performance Radar Comparison</h3>
          <Radar 
            data={radarData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Performance Profile Comparison'
                }
              },
              scales: {
                r: {
                  beginAtZero: true
                }
              }
            }}
          />
        </div>
      </div>
    );
  };

  const renderPlayerCards = () => {
    return (
      <div className="player-cards">
        <h3>Selected Players ({selectedPlayers.length}/4)</h3>
        <div className="selected-players">
          {selectedPlayers.map(player => (
            <div key={player.id} className="selected-player-card">
              <div className="player-info">
                <h4>{player.name}</h4>
                <p>{player.position} • {player.statistics?.goals || 0} goals</p>
              </div>
              <button 
                className="remove-player"
                onClick={() => handlePlayerSelect(player)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content player-comparison-modal" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        <div className="comparison-header">
          <h2>Player Comparison</h2>
          <p>Select up to 4 players to compare their statistics and performance</p>
        </div>

        <div className="comparison-content">
          <div className="team-selection">
            <h3>Select Team</h3>
            <select 
              value={selectedTeam?.id || ''} 
              onChange={(e) => setSelectedTeam(teams.find(t => t.id === parseInt(e.target.value)))}
            >
              <option value="">Choose a team...</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          {selectedTeam && (
            <div className="players-selection">
              <h3>Select Players to Compare</h3>
              {loading ? (
                <div className="loading">Loading players...</div>
              ) : (
                <div className="players-grid">
                  {teamPlayers.map(player => (
                    <div 
                      key={player.id} 
                      className={`player-card ${selectedPlayers.find(p => p.id === player.id) ? 'selected' : ''}`}
                      onClick={() => handlePlayerSelect(player)}
                    >
                      <div className="player-name">{player.name}</div>
                      <div className="player-position">{player.position}</div>
                      <div className="player-stats">
                        <span>{player.statistics?.goals || 0} goals</span>
                        <span>{player.statistics?.assists || 0} assists</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedPlayers.length >= 2 && renderPlayerCards()}

          {comparisonData && (
            <div className="comparison-results">
              <h3>Comparison Results</h3>
              {renderComparisonCharts()}
            </div>
          )}

          {error && (
            <div className="error">
              <p>{error}</p>
              <button onClick={() => setError(null)}>Dismiss</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerComparison; 