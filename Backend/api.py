from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
from typing import List, Dict, Any
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables from .env file and config.env
load_dotenv()  # Load from .env file
load_dotenv("config.env")  # Also load from config.env file

app = FastAPI(title="Football Analysis API", version="1.0.0")

# Add CORS middleware to allow requests from React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Football-Data.org API configuration
FOOTBALL_DATA_API_KEY = os.getenv("FOOTBALL_DATA_API_KEY")
if not FOOTBALL_DATA_API_KEY:
    raise ValueError(
        "FOOTBALL_DATA_API_KEY environment variable is required. "
        "Please create a .env file or config.env file in the Backend directory with your API key:\n"
        "FOOTBALL_DATA_API_KEY=your_actual_api_key_here\n\n"
        "Get your API key from: https://www.football-data.org/client/register"
    )

BASE_URL = "https://api.football-data.org/v4"

# Headers for API requests
headers = {
    "X-Auth-Token": FOOTBALL_DATA_API_KEY
}

# Mock player database for enhanced statistics
MOCK_PLAYERS_DB = {}

@app.get("/")
async def root():
    return {"message": "Football Analysis API is running!"}

@app.get("/teams")
async def get_teams():
    """Get teams from Premier League (England)"""
    try:
        # Premier League ID is 2021 in Football-Data.org API
        url = f"{BASE_URL}/competitions/PL/teams"
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            teams = []
            
            # Extract basic team information
            for team in data.get("teams", []):
                teams.append({
                    "id": team.get("id"),
                    "name": team.get("name"),
                    "shortName": team.get("shortName"),
                    "founded": team.get("founded"),
                    "venue": team.get("venue"),
                    "website": team.get("website"),
                    "crest": team.get("crest")
                })
            
            return {
                "success": True,
                "count": len(teams),
                "teams": teams
            }
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Failed to fetch teams: {response.text}"
            )
    
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"API request failed: {str(e)}")

@app.get("/team/{team_id}")
async def get_team_details(team_id: int):
    """Get detailed information about a specific team"""
    try:
        url = f"{BASE_URL}/teams/{team_id}"
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            return {
                "success": True,
                "team": {
                    "id": data.get("id"),
                    "name": data.get("name"),
                    "shortName": data.get("shortName"),
                    "founded": data.get("founded"),
                    "venue": data.get("venue"),
                    "website": data.get("website"),
                    "crest": data.get("crest"),
                    "coach": data.get("coach", {}).get("name") if data.get("coach") else None,
                    "squadSize": len(data.get("squad", []))
                }
            }
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Failed to fetch team details: {response.text}"
            )
    
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"API request failed: {str(e)}")

@app.get("/matches")
async def get_recent_matches():
    """Get recent Premier League matches"""
    try:
        url = f"{BASE_URL}/competitions/PL/matches"
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            matches = []
            
            # Get last 10 matches
            for match in data.get("matches", [])[:10]:
                matches.append({
                    "id": match.get("id"),
                    "homeTeam": match.get("homeTeam", {}).get("name"),
                    "awayTeam": match.get("awayTeam", {}).get("name"),
                    "score": {
                        "home": match.get("score", {}).get("fullTime", {}).get("home"),
                        "away": match.get("score", {}).get("fullTime", {}).get("away")
                    },
                    "status": match.get("status"),
                    "date": match.get("utcDate")
                })
            
            return {
                "success": True,
                "count": len(matches),
                "matches": matches
            }
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Failed to fetch matches: {response.text}"
            )
    
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"API request failed: {str(e)}")

@app.get("/team/{team_id}/players")
async def get_team_players(team_id: int):
    """Get all players for a specific team with enhanced statistics"""
    try:
        url = f"{BASE_URL}/teams/{team_id}"
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            players = []
            
            for player in data.get("squad", []):
                # Generate or get cached player stats
                player_id = player.get("id")
                if player_id not in MOCK_PLAYERS_DB:
                    MOCK_PLAYERS_DB[player_id] = generate_mock_player_stats(player.get("position", ""))
                
                players.append({
                    "id": player.get("id"),
                    "name": player.get("name"),
                    "position": player.get("position"),
                    "nationality": player.get("nationality"),
                    "dateOfBirth": player.get("dateOfBirth"),
                    "age": calculate_age(player.get("dateOfBirth")) if player.get("dateOfBirth") else None,
                    "statistics": MOCK_PLAYERS_DB[player_id]
                })
            
            return {
                "success": True,
                "team": {
                    "id": data.get("id"),
                    "name": data.get("name"),
                    "crest": data.get("crest")
                },
                "players": players,
                "count": len(players)
            }
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Failed to fetch team players: {response.text}"
            )
    
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"API request failed: {str(e)}")

@app.get("/player/{player_id}")
async def get_player_profile(player_id: int):
    """Get detailed player profile and statistics"""
    try:
        url = f"{BASE_URL}/persons/{player_id}"
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            
            # Calculate age if date of birth is available
            age = calculate_age(data.get("dateOfBirth")) if data.get("dateOfBirth") else None
            
            player_profile = {
                "id": data.get("id"),
                "name": data.get("name"),
                "firstName": data.get("firstName"),
                "lastName": data.get("lastName"),
                "position": data.get("position"),
                "nationality": data.get("nationality"),
                "dateOfBirth": data.get("dateOfBirth"),
                "age": age,
                "currentTeam": data.get("currentTeam", {}).get("name") if data.get("currentTeam") else None,
                "shirtNumber": data.get("shirtNumber"),
                "section": data.get("section")
            }
            
            # Generate or get cached statistics
            if player_id not in MOCK_PLAYERS_DB:
                MOCK_PLAYERS_DB[player_id] = generate_mock_player_stats(data.get("position", ""))
            
            # Generate performance trends (last 10 matches)
            performance_trends = generate_performance_trends(data.get("position", ""))
            
            # Generate heat map data
            heat_map_data = generate_heat_map_data(data.get("position", ""))
            
            return {
                "success": True,
                "player": player_profile,
                "statistics": MOCK_PLAYERS_DB[player_id],
                "performance_trends": performance_trends,
                "heat_map_data": heat_map_data
            }
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Failed to fetch player profile: {response.text}"
            )
    
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"API request failed: {str(e)}")

@app.get("/players/search")
async def search_players(team_id: int = None, position: str = None, name: str = None):
    """Search for players by various criteria"""
    try:
        if not team_id:
            raise HTTPException(status_code=400, detail="team_id parameter is required")
        
        # Get team players first
        team_players = await get_team_players(team_id)
        
        if not team_players.get("success"):
            raise HTTPException(status_code=404, detail="Team not found")
        
        players = team_players["players"]
        
        # Filter by position if specified
        if position:
            players = [p for p in players if p.get("position", "").lower() == position.lower()]
        
        # Filter by name if specified
        if name:
            players = [p for p in players if name.lower() in p.get("name", "").lower()]
        
        return {
            "success": True,
            "players": players,
            "count": len(players),
            "filters": {
                "team_id": team_id,
                "position": position,
                "name": name
            }
        }
    
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"API request failed: {str(e)}")

@app.get("/players/compare")
async def compare_players(player_ids: str):
    """Compare multiple players side by side"""
    try:
        if not player_ids:
            raise HTTPException(status_code=400, detail="player_ids parameter is required")
        
        player_id_list = [int(pid.strip()) for pid in player_ids.split(",")]
        if len(player_id_list) < 2:
            raise HTTPException(status_code=400, detail="At least 2 player IDs are required for comparison")
        
        compared_players = []
        
        for player_id in player_id_list:
            try:
                player_data = await get_player_profile(player_id)
                if player_data.get("success"):
                    compared_players.append(player_data)
            except:
                continue
        
        if len(compared_players) < 2:
            raise HTTPException(status_code=404, detail="Could not find enough players for comparison")
        
        return {
            "success": True,
            "players": compared_players,
            "comparison_metrics": generate_comparison_metrics(compared_players)
        }
    
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid player IDs format")

@app.get("/players/top-performers")
async def get_top_performers(metric: str = "goals", limit: int = 10):
    """Get top performing players by specific metric"""
    try:
        # Get all teams first
        teams_response = await get_teams()
        if not teams_response.get("success"):
            raise HTTPException(status_code=500, detail="Failed to fetch teams")
        
        all_players = []
        
        # Get players from first few teams for demo
        for team in teams_response["teams"][:5]:  # Limit to first 5 teams for performance
            try:
                team_players = await get_team_players(team["id"])
                if team_players.get("success"):
                    all_players.extend(team_players["players"])
            except:
                continue
        
        # Sort players by the specified metric
        sorted_players = sorted(
            all_players,
            key=lambda x: x.get("statistics", {}).get(metric, 0),
            reverse=True
        )
        
        return {
            "success": True,
            "metric": metric,
            "players": sorted_players[:limit],
            "count": len(sorted_players[:limit])
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get top performers: {str(e)}")

@app.get("/players/statistics/league-leaders")
async def get_league_leaders():
    """Get league leaders in various statistical categories"""
    try:
        # Get top performers for different metrics
        goals_leaders = await get_top_performers("goals", 5)
        assists_leaders = await get_top_performers("assists", 5)
        clean_sheets_leaders = await get_top_performers("clean_sheets", 5)
        pass_accuracy_leaders = await get_top_performers("pass_accuracy", 5)
        
        return {
            "success": True,
            "league_leaders": {
                "goals": goals_leaders.get("players", []),
                "assists": assists_leaders.get("players", []),
                "clean_sheets": clean_sheets_leaders.get("players", []),
                "pass_accuracy": pass_accuracy_leaders.get("players", [])
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get league leaders: {str(e)}")

def calculate_age(date_of_birth: str) -> int:
    """Calculate age from date of birth string"""
    try:
        from datetime import datetime
        birth_date = datetime.fromisoformat(date_of_birth.replace('Z', '+00:00'))
        today = datetime.now()
        return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
    except:
        return None

def generate_mock_player_stats(position: str) -> dict:
    """Generate realistic mock statistics based on player position"""
    import random
    
    # Base stats that vary by position
    base_stats = {
        "appearances": random.randint(15, 35),
        "minutes_played": random.randint(800, 2500),
        "goals": 0,
        "assists": 0,
        "yellow_cards": random.randint(0, 8),
        "red_cards": random.randint(0, 1),
        "passes_completed": random.randint(200, 1500),
        "pass_accuracy": random.uniform(70, 95),
        "tackles": random.randint(10, 80),
        "interceptions": random.randint(5, 60),
        "aerial_duels_won": random.randint(10, 100),
        "shots": random.randint(5, 80),
        "shots_on_target": random.randint(2, 40),
        "dribbles_completed": random.randint(5, 50),
        "fouls_committed": random.randint(5, 40),
        "clean_sheets": 0
    }
    
    # Position-specific adjustments
    if position in ["Goalkeeper", "Goalie"]:
        base_stats.update({
            "goals": 0,
            "assists": random.randint(0, 2),
            "saves": random.randint(40, 120),
            "clean_sheets": random.randint(5, 15),
            "goals_conceded": random.randint(15, 45),
            "pass_accuracy": random.uniform(40, 70)
        })
    elif position in ["Defender", "Centre-Back", "Left-Back", "Right-Back"]:
        base_stats.update({
            "goals": random.randint(0, 5),
            "assists": random.randint(0, 8),
            "tackles": random.randint(30, 80),
            "interceptions": random.randint(20, 60),
            "aerial_duels_won": random.randint(30, 100),
            "clean_sheets": random.randint(8, 18)
        })
    elif position in ["Midfielder", "Defensive Midfield", "Central Midfield", "Attacking Midfield"]:
        base_stats.update({
            "goals": random.randint(2, 12),
            "assists": random.randint(3, 15),
            "passes_completed": random.randint(800, 1500),
            "pass_accuracy": random.uniform(80, 95),
            "dribbles_completed": random.randint(20, 50)
        })
    elif position in ["Winger", "Left Winger", "Right Winger"]:
        base_stats.update({
            "goals": random.randint(5, 15),
            "assists": random.randint(8, 20),
            "dribbles_completed": random.randint(30, 60),
            "shots": random.randint(30, 80),
            "shots_on_target": random.randint(15, 40)
        })
    elif position in ["Forward", "Centre-Forward", "Striker"]:
        base_stats.update({
            "goals": random.randint(8, 25),
            "assists": random.randint(3, 12),
            "shots": random.randint(50, 120),
            "shots_on_target": random.randint(25, 60),
            "aerial_duels_won": random.randint(40, 100)
        })
    
    # Calculate derived stats
    if base_stats["shots"] > 0:
        base_stats["shot_accuracy"] = (base_stats["shots_on_target"] / base_stats["shots"]) * 100
    else:
        base_stats["shot_accuracy"] = 0
    
    if base_stats["minutes_played"] > 0:
        base_stats["goals_per_90"] = (base_stats["goals"] / base_stats["minutes_played"]) * 90
        base_stats["assists_per_90"] = (base_stats["assists"] / base_stats["minutes_played"]) * 90
    else:
        base_stats["goals_per_90"] = 0
        base_stats["assists_per_90"] = 0
    
    return base_stats

def generate_performance_trends(position: str) -> dict:
    """Generate performance trends for the last 10 matches"""
    trends = {
        "matches": [],
        "goals": [],
        "assists": [],
        "rating": [],
        "minutes": []
    }
    
    # Generate last 10 match data
    for i in range(10):
        match_date = datetime.now() - timedelta(days=(9-i)*7)  # Weekly matches
        trends["matches"].append(match_date.strftime("%Y-%m-%d"))
        
        # Generate realistic match performance
        if position in ["Forward", "Striker", "Winger"]:
            goals = random.randint(0, 2)
            assists = random.randint(0, 1)
        elif position in ["Midfielder"]:
            goals = random.randint(0, 1)
            assists = random.randint(0, 2)
        else:
            goals = random.randint(0, 1)
            assists = random.randint(0, 1)
        
        trends["goals"].append(goals)
        trends["assists"].append(assists)
        trends["rating"].append(round(random.uniform(6.0, 9.5), 1))
        trends["minutes"].append(random.randint(60, 90))
    
    return trends

def generate_heat_map_data(position: str) -> dict:
    """Generate heat map data for player activity on the field"""
    # Create a 10x10 grid representing the field
    grid_size = 10
    heat_map = [[0 for _ in range(grid_size)] for _ in range(grid_size)]
    
    # Position-specific activity patterns
    if position in ["Goalkeeper", "Goalie"]:
        # Goalkeepers stay mostly in their own half
        for i in range(grid_size):
            for j in range(grid_size):
                if j < 3:  # Own half
                    heat_map[i][j] = random.randint(20, 80)
                else:
                    heat_map[i][j] = random.randint(0, 10)
    
    elif position in ["Defender"]:
        # Defenders mostly in defensive areas
        for i in range(grid_size):
            for j in range(grid_size):
                if j < 5:  # Defensive half
                    heat_map[i][j] = random.randint(30, 90)
                else:
                    heat_map[i][j] = random.randint(5, 40)
    
    elif position in ["Midfielder"]:
        # Midfielders cover the middle areas
        for i in range(grid_size):
            for j in range(grid_size):
                if 2 <= j <= 7:  # Middle areas
                    heat_map[i][j] = random.randint(40, 100)
                else:
                    heat_map[i][j] = random.randint(10, 50)
    
    elif position in ["Forward", "Striker"]:
        # Forwards focus on attacking areas
        for i in range(grid_size):
            for j in range(grid_size):
                if j >= 5:  # Attacking half
                    heat_map[i][j] = random.randint(50, 100)
                else:
                    heat_map[i][j] = random.randint(10, 60)
    
    else:
        # Default pattern
        for i in range(grid_size):
            for j in range(grid_size):
                heat_map[i][j] = random.randint(10, 80)
    
    return {
        "grid": heat_map,
        "max_value": max(max(row) for row in heat_map),
        "min_value": min(min(row) for row in heat_map)
    }

def generate_comparison_metrics(players_data: List[Dict]) -> dict:
    """Generate comparison metrics for multiple players"""
    comparison = {
        "metrics": ["goals", "assists", "minutes_played", "pass_accuracy", "tackles", "shots"],
        "players": []
    }
    
    for player_data in players_data:
        player = player_data["player"]
        stats = player_data["statistics"]
        
        player_metrics = {
            "name": player["name"],
            "position": player["position"],
            "team": player.get("currentTeam", "Unknown"),
            "values": {
                "goals": stats.get("goals", 0),
                "assists": stats.get("assists", 0),
                "minutes_played": stats.get("minutes_played", 0),
                "pass_accuracy": round(stats.get("pass_accuracy", 0), 1),
                "tackles": stats.get("tackles", 0),
                "shots": stats.get("shots", 0)
            }
        }
        comparison["players"].append(player_metrics)
    
    return comparison

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)