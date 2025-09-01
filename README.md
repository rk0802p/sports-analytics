# ⚽ Football Analytics Platform

A comprehensive sports analytics platform for Premier League data analysis, featuring detailed player statistics, performance trends, heat maps, and comparison tools.

## 🚀 Features

### 📊 Player Statistics & Analysis
- **Detailed Player Profiles**: Comprehensive statistics including goals, assists, minutes played, pass accuracy, tackles, and more
- **Performance Trends**: Visual charts showing player performance over the last 10 matches
- **Heat Maps**: Interactive field activity heat maps showing player positioning and movement patterns
- **Performance Radar Charts**: Multi-dimensional performance analysis using radar charts

### ⚖️ Player Comparison Tools
- **Side-by-Side Comparison**: Compare up to 4 players simultaneously
- **Statistical Comparison**: Bar charts and radar charts for easy comparison
- **Multiple Metrics**: Compare goals, assists, pass accuracy, tackles, minutes played, and shots
- **Team-based Selection**: Select players from specific teams for comparison

### 🏆 League Leaders
- **Category Leaders**: Top performers in goals, assists, clean sheets, and pass accuracy
- **Interactive Leaderboards**: Sortable tables with player rankings
- **Visual Charts**: Bar charts showing leaderboard data
- **Multiple Categories**: Switch between different statistical categories

### 🏟️ Team & Match Data
- **Team Information**: Detailed team profiles with squad sizes, coaches, and venues
- **Recent Matches**: Latest Premier League match results and statistics
- **Player Rosters**: Complete team player lists with basic statistics

## 🛠️ Technology Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **Python**: Core programming language
- **Football-Data.org API**: External data source for Premier League information
- **Mock Data Generation**: Realistic player statistics for demonstration

### Frontend
- **React**: Modern JavaScript library for building user interfaces
- **Chart.js**: Comprehensive charting library for data visualization
- **React-Chartjs-2**: React wrapper for Chart.js
- **Axios**: HTTP client for API communication
- **CSS3**: Modern styling with responsive design

## 📦 Installation & Setup

### Prerequisites
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download here](https://www.python.org/downloads/)
- **npm** or **yarn** (comes with Node.js)
- **Git** (for cloning the repository)

### 🔑 Step 1: Get Your API Key (Required)

**You need a Football-Data.org API key to use this platform:**

1. **Visit**: [Football-Data.org](https://www.football-data.org/client/register)
2. **Register** for a free account
3. **Verify your email** and log in
4. **Get your API key** from your dashboard
5. **Copy the API key** - you'll need it in the next step

### 🚀 Step 2: Clone & Setup Project

```bash
# Clone the repository
git clone <your-repo-url>
cd sports-analytics

# Or if you already have the project, navigate to it
cd sports-analytics
```

### ⚙️ Step 3: Configure Backend

```bash
# Navigate to backend directory
cd Backend

# Install Python dependencies
pip install -r requirements.txt

# Run the setup script to configure your API key
python setup.py
```

**Or manually create `.env` file:**
```bash
# Create .env file in Backend directory
echo "FOOTBALL_DATA_API_KEY=your_actual_api_key_here" > .env
```

### 🎯 Step 4: Start Backend Server

```bash
# Make sure you're in the Backend directory
cd Backend

# Start the FastAPI server
python api.py
```

**Expected output:**
```
INFO:     Started server process [xxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

**✅ Backend is running when you see:**
- Server started on `http://localhost:8000`
- No error messages
- API documentation available at `http://localhost:8000/docs`

### 🌐 Step 5: Start Frontend

**Open a new terminal window/tab:**

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start React development server
npm start
```

**Expected output:**
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000

Note that the development build is not optimized.
To create a production build, use npm run build.
```

**✅ Frontend is running when you see:**
- Browser opens automatically to `http://localhost:3000`
- Football Analytics Platform loads without errors
- You can see the main dashboard

## 🔍 Verification & Testing

### Test Backend API
```bash
# Test if backend is responding
curl http://localhost:8000/

# Expected response:
# {"message": "Football Analysis API is running!"}

# Test teams endpoint
curl http://localhost:8000/teams
```

### Test Frontend
1. **Open browser** to `http://localhost:3000`
2. **Check navigation tabs** - Teams, Matches, Player Analysis
3. **Click on a team** to see team details
4. **Navigate to Player Analysis** tab
5. **Select a team** to view players

## 🚨 Troubleshooting

### Backend Issues

**Port 8000 already in use:**
```bash
# Find process using port 8000
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # Mac/Linux

# Kill the process or use different port
python api.py --port 8001
```

**API key not found:**
```bash
# Check if .env file exists
ls -la Backend/.env

# Verify API key in .env file
cat Backend/.env

# Re-run setup
cd Backend
python setup.py
```

**Python packages missing:**
```bash
# Reinstall requirements
pip install -r requirements.txt --force-reinstall

# Or install individually
pip install fastapi uvicorn requests python-dotenv
```

### Frontend Issues

**Port 3000 already in use:**
```bash
# React will automatically suggest a different port
# Or manually specify:
PORT=3001 npm start
```

**Dependencies not installed:**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Build errors:**
```bash
# Check for syntax errors
npm run build

# Clear build cache
rm -rf build
npm start
```

## 🎮 How to Use the Platform

### 1. **View Teams & Matches**
- Click "Teams" tab to see all Premier League teams
- Click "Recent Matches" to view latest match results
- Click on any team card to see detailed information

### 2. **Player Analysis**
- Click "Player Analysis" tab
- Select a team from the list
- Browse through all players with their statistics
- Use search and position filters to find specific players
- Click on any player card to see detailed profile

### 3. **Player Profiles**
- **Overview**: Key statistics and performance summary
- **Statistics**: Comprehensive season statistics with radar charts
- **Performance Trends**: Line charts showing last 10 matches
- **Heat Maps**: Field activity visualization

### 4. **Player Comparison**
- Click "Compare Players" button
- Select a team and choose 2-4 players
- View side-by-side comparison charts
- Analyze performance across multiple metrics

### 5. **League Leaders**
- Click "League Leaders" button
- Switch between different categories (goals, assists, etc.)
- View top performers and their statistics
- Analyze league-wide performance data

## 🔧 Configuration Options

### Environment Variables
The platform automatically loads configuration from:
1. `.env` file (created by setup script)
2. `config.env` file (alternative configuration)
3. System environment variables

**Available variables:**
- `FOOTBALL_DATA_API_KEY` - Your Football-Data.org API key (required)
- `API_BASE_URL` - API base URL (default: https://api.football-data.org/v4)
- `DEBUG_MODE` - Enable debug logging (true/false)

### Custom Ports
```bash
# Backend on different port
python api.py --port 8001

# Frontend on different port
PORT=3001 npm start
```

## 📱 Platform Access

### Local Development
- **Backend API**: `http://localhost:8000`
- **Frontend App**: `http://localhost:3000`
- **API Docs**: `http://localhost:8000/docs`

### Network Access
- **Backend**: `http://your-ip:8000`
- **Frontend**: `http://your-ip:3000`

## 🚀 Production Deployment

### Backend Deployment
```bash
# Install production dependencies
pip install -r requirements.txt

# Run with production server
uvicorn api:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend Deployment
```bash
# Build production version
npm run build

# Serve static files
npx serve -s build -l 3000
```

## 🔮 Future Enhancements

### Planned Features
- **Real-time match data**: Live match statistics and updates
- **Advanced analytics**: Expected goals (xG), player value metrics
- **Historical data**: Multi-season statistics and trends
- **Team tactics analysis**: Formation and strategy visualization
- **Player scouting tools**: Advanced filtering and recommendation system

### Technical Improvements
- **Database integration**: Persistent data storage
- **Caching system**: Improved performance for frequently accessed data
- **Authentication**: User accounts and personalized dashboards
- **Export functionality**: PDF reports and data export options

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Football-Data.org](https://www.football-data.org/) for providing the API
- [Chart.js](https://www.chartjs.org/) for excellent charting capabilities
- [React](https://reactjs.org/) for the amazing frontend framework
- [FastAPI](https://fastapi.tiangolo.com/) for the modern Python web framework

## 📞 Support

For questions, issues, or feature requests, please open an issue on GitHub or contact the development team.

---

**⚽ Enjoy exploring Premier League statistics and player analysis!** 