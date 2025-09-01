import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import PlayerProfile from './components/PlayerProfile';
import PlayerComparison from './components/PlayerComparison';
import LeagueLeaders from './components/LeagueLeaders';

const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [activeTab, setActiveTab] = useState('teams');
  
  // Player analysis states
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showPlayerComparison, setShowPlayerComparison] = useState(false);
  const [showLeagueLeaders, setShowLeagueLeaders] = useState(false);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [playerSearchTerm, setPlayerSearchTerm] = useState('');
  const [playerPositionFilter, setPlayerPositionFilter] = useState('');

  // Fetch teams data
  const fetchTeams = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/teams`);
      if (response.data.success) {
        setTeams(response.data.teams);
      }
    } catch (err) {
      setError('Failed to fetch teams data');
      console.error(err);
    }
  };

  // Fetch matches data
  const fetchMatches = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/matches`);
      if (response.data.success) {
        setMatches(response.data.matches);
      }
    } catch (err) {
      setError('Failed to fetch matches data');
      console.error(err);
    }
  };

  // Fetch team details
  const fetchTeamDetails = async (teamId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/team/${teamId}`);
      if (response.data.success) {
        setSelectedTeam(response.data.team);
      }
    } catch (err) {
      setError('Failed to fetch team details');
      console.error(err);
    }
  };

  // Fetch team players
  const fetchTeamPlayers = async (teamId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/team/${teamId}/players`);
      if (response.data.success) {
        setTeamPlayers(response.data.players);
      }
    } catch (err) {
      setError('Failed to fetch team players');
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchTeams(), fetchMatches()]);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleTeamClick = (team) => {
    fetchTeamDetails(team.id);
    fetchTeamPlayers(team.id);
  };

  const closeTeamDetails = () => {
    setSelectedTeam(null);
    setTeamPlayers([]);
  };

  const handlePlayerClick = (playerId) => {
    setSelectedPlayer(playerId);
  };

  const closePlayerProfile = () => {
    setSelectedPlayer(null);
  };

  const filteredPlayers = teamPlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(playerSearchTerm.toLowerCase());
    const matchesPosition = !playerPositionFilter || player.position === playerPositionFilter;
    return matchesSearch && matchesPosition;
  });

  if (loading) {
    return (
      <div className="App">
        <div className="loading">
          <h2>Loading football data...</h2>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>⚽ Football Analysis Platform</h1>
        <p>Premier League Data Dashboard</p>
      </header>

      <nav className="tab-nav">
        <button 
          className={activeTab === 'teams' ? 'active' : ''}
          onClick={() => setActiveTab('teams')}
        >
          Teams ({teams.length})
        </button>
        <button 
          className={activeTab === 'matches' ? 'active' : ''}
          onClick={() => setActiveTab('matches')}
        >
          Recent Matches ({matches.length})
        </button>
        <button 
          className={activeTab === 'players' ? 'active' : ''}
          onClick={() => setActiveTab('players')}
        >
          Player Analysis
        </button>
        <button 
          className="analysis-button"
          onClick={() => setShowPlayerComparison(true)}
        >
          Compare Players
        </button>
        <button 
          className="analysis-button"
          onClick={() => setShowLeagueLeaders(true)}
        >
          League Leaders
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'teams' && (
          <div className="teams-section">
            <h2>Premier League Teams</h2>
            <div className="teams-grid">
              {teams.map(team => (
                <div 
                  key={team.id} 
                  className="team-card"
                  onClick={() => handleTeamClick(team)}
                >
                  <div className="team-header">
                    {team.crest && (
                      <img 
                        src={team.crest} 
                        alt={`${team.name} logo`}
                        className="team-logo"
                      />
                    )}
                    <div className="team-info">
                      <h3>{team.name}</h3>
                      <p className="team-short-name">{team.shortName}</p>
                    </div>
                  </div>
                  <div className="team-details">
                    <p><strong>Founded:</strong> {team.founded}</p>
                    <p><strong>Venue:</strong> {team.venue}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="matches-section">
            <h2>Recent Premier League Matches</h2>
            <div className="matches-list">
              {matches.map(match => (
                <div key={match.id} className="match-card">
                  <div className="match-teams">
                    <span className="home-team">{match.homeTeam}</span>
                    <span className="vs">vs</span>
                    <span className="away-team">{match.awayTeam}</span>
                  </div>
                  <div className="match-score">
                    {match.score.home !== null && match.score.away !== null ? (
                      <span className="score">
                        {match.score.home} - {match.score.away}
                      </span>
                    ) : (
                      <span className="status">{match.status}</span>
                    )}
                  </div>
                  <div className="match-date">
                    {new Date(match.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'players' && (
          <div className="players-section">
            <h2>Player Statistics & Analysis</h2>
            <div className="players-intro">
              <p>Select a team to view player statistics, performance trends, and detailed analysis.</p>
              <div className="players-features">
                <div className="feature">
                  <span className="feature-icon">📊</span>
                  <span>Detailed Statistics</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">📈</span>
                  <span>Performance Trends</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">🗺️</span>
                  <span>Heat Maps</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">⚖️</span>
                  <span>Player Comparison</span>
                </div>
              </div>
            </div>
            
            {!selectedTeam ? (
              <div className="teams-grid">
                {teams.map(team => (
                  <div 
                    key={team.id} 
                    className="team-card"
                    onClick={() => handleTeamClick(team)}
                  >
                    <div className="team-header">
                      {team.crest && (
                        <img 
                          src={team.crest} 
                          alt={`${team.name} logo`}
                          className="team-logo"
                        />
                      )}
                      <div className="team-info">
                        <h3>{team.name}</h3>
                        <p className="team-short-name">{team.shortName}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="team-players-section">
                <div className="team-players-header">
                  <div className="team-info-header">
                    {selectedTeam.crest && (
                      <img 
                        src={selectedTeam.crest} 
                        alt={`${selectedTeam.name} logo`}
                        className="team-logo-small"
                      />
                    )}
                    <h3>{selectedTeam.name} Players</h3>
                    <button className="back-button" onClick={closeTeamDetails}>
                      ← Back to Teams
                    </button>
                  </div>
                  
                  <div className="players-filters">
                    <input
                      type="text"
                      placeholder="Search players..."
                      value={playerSearchTerm}
                      onChange={(e) => setPlayerSearchTerm(e.target.value)}
                      className="player-search"
                    />
                    <select
                      value={playerPositionFilter}
                      onChange={(e) => setPlayerPositionFilter(e.target.value)}
                      className="position-filter"
                    >
                      <option value="">All Positions</option>
                      <option value="Goalkeeper">Goalkeeper</option>
                      <option value="Defender">Defender</option>
                      <option value="Midfielder">Midfielder</option>
                      <option value="Forward">Forward</option>
                    </select>
                  </div>
                </div>

                <div className="players-grid">
                  {filteredPlayers.map(player => (
                    <div 
                      key={player.id} 
                      className="player-card"
                      onClick={() => handlePlayerClick(player.id)}
                    >
                      <div className="player-header">
                        <h4>{player.name}</h4>
                        <span className="player-position">{player.position}</span>
                      </div>
                      <div className="player-stats">
                        <div className="stat-item">
                          <span className="stat-label">Goals:</span>
                          <span className="stat-value">{player.statistics?.goals || 0}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Assists:</span>
                          <span className="stat-value">{player.statistics?.assists || 0}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Apps:</span>
                          <span className="stat-value">{player.statistics?.appearances || 0}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Age:</span>
                          <span className="stat-value">{player.age || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="player-nationality">
                        {player.nationality}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Team Details Modal */}
      {selectedTeam && activeTab !== 'players' && (
        <div className="modal-overlay" onClick={closeTeamDetails}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={closeTeamDetails}>×</button>
            <div className="team-detail-header">
              {selectedTeam.crest && (
                <img 
                  src={selectedTeam.crest} 
                  alt={`${selectedTeam.name} logo`}
                  className="team-logo-large"
                />
              )}
              <h2>{selectedTeam.name}</h2>
            </div>
            <div className="team-detail-info">
              <p><strong>Short Name:</strong> {selectedTeam.shortName}</p>
              <p><strong>Founded:</strong> {selectedTeam.founded}</p>
              <p><strong>Venue:</strong> {selectedTeam.venue}</p>
              <p><strong>Squad Size:</strong> {selectedTeam.squadSize} players</p>
              {selectedTeam.coach && (
                <p><strong>Coach:</strong> {selectedTeam.coach}</p>
              )}
              {selectedTeam.website && (
                <p>
                  <strong>Website:</strong> 
                  <a href={selectedTeam.website} target="_blank" rel="noopener noreferrer">
                    {selectedTeam.website}
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Player Profile Modal */}
      {selectedPlayer && (
        <PlayerProfile 
          playerId={selectedPlayer} 
          onClose={closePlayerProfile} 
        />
      )}

      {/* Player Comparison Modal */}
      {showPlayerComparison && (
        <PlayerComparison 
          onClose={() => setShowPlayerComparison(false)} 
        />
      )}

      {/* League Leaders Modal */}
      {showLeagueLeaders && (
        <LeagueLeaders 
          onClose={() => setShowLeagueLeaders(false)} 
        />
      )}
    </div>
  );
}

export default App;