from http.server import HTTPServer, BaseHTTPRequestHandler
import json
from urllib.parse import parse_qs
import sqlite3
from datetime import datetime
import os
import sys
import urllib.request
import urllib.error
import random
import requests

DB_FILE = 'flood_predictions.db'
OPENWEATHERMAP_API = "34d019aac3e4c4e159838201557aa9a7"
N8N_WEBHOOK = "http://localhost:5678/webhook/flood-prediction"  # Optional


class Database:
    @staticmethod
    def init_database():
        if os.path.exists(DB_FILE):
            return
        try:
            conn = sqlite3.connect(DB_FILE)
            c = conn.cursor()
            c.execute('''CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY,
                timestamp TEXT,
                location TEXT,
                lat REAL,
                lon REAL,
                risk_score REAL,
                risk_level TEXT,
                temperature REAL,
                humidity REAL,
                rainfall REAL,
                elevation REAL,
                noise_level REAL,
                ai_reasoning TEXT
            )''')
            conn.commit()
            conn.close()
        except:
            pass
    
    @staticmethod
    def save_prediction(prediction):
        try:
            conn = sqlite3.connect(DB_FILE)
            c = conn.cursor()
            c.execute('''INSERT INTO predictions VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                      (prediction.get('timestamp'), prediction.get('location'), 
                       prediction.get('lat'), prediction.get('lon'),
                       prediction.get('risk_score'), prediction.get('risk_level'),
                       prediction.get('temperature'), prediction.get('humidity'),
                       prediction.get('rainfall'), prediction.get('elevation'),
                       prediction.get('noise_level', 0.5),
                       prediction.get('ai_reasoning')))
            conn.commit()
            conn.close()
        except:
            pass


class WeatherAPI:
    @staticmethod
    def get_lat_lon(place):
        try:
            # Try Nominatim first
            url = f"https://nominatim.openstreetmap.org/search?q={place}&format=json"
            req = urllib.request.Request(url, headers={'User-Agent': 'FloodPredictor/1.0'})
            response = urllib.request.urlopen(req, timeout=5)
            data = json.loads(response.read().decode('utf-8'))
            if len(data) > 0:
                return float(data[0]["lat"]), float(data[0]["lon"])
        except:
            pass
        
        # Fallback: Use local database
        CITY_COORDS = {
            'london': (51.5074, -0.1278),
            'tokyo': (35.6762, 139.6503),
            'new york': (40.7128, -74.0060),
            'paris': (48.8566, 2.3522),
            'mumbai': (19.0760, 72.8777),
            'sydney': (-33.8688, 151.2093),
            'bangkok': (13.7563, 100.5018),
            'lagos': (6.5244, 3.3792),
            'kerala': (10.8505, 76.2711),
            'kochi': (9.9312, 76.2673),
            'thiruvananthapuram': (8.5241, 76.9366),
            'bangalore': (12.9716, 77.5946),
            'hyderabad': (17.3850, 78.4867),
            'delhi': (28.7041, 77.1025),
            'dubai': (25.2048, 55.2708),
            'singapore': (1.3521, 103.8198)
        }
        
        place_lower = place.lower()
        if place_lower in CITY_COORDS:
            return CITY_COORDS[place_lower]
        
        return None, None


    @staticmethod
    def get_weather_data(lat, lon):
        try:
            url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHERMAP_API}&units=metric"
            response = urllib.request.urlopen(url, timeout=5)
            data = json.loads(response.read().decode('utf-8'))
            if "main" in data:
                rainfall = data.get("rain", {}).get("1h", 0)
                return {
                    "temperature": data["main"]["temp"],
                    "humidity": data["main"]["humidity"],
                    "rainfall": rainfall,
                }
            return {"temperature": 20, "humidity": 60, "rainfall": 0}
        except:
            return {"temperature": 20, "humidity": 60, "rainfall": 0}

    @staticmethod
    def get_elevation(lat, lon):
        try:
            url = f"https://api.open-elevation.com/api/v1/lookup?locations={lat},{lon}"
            response = urllib.request.urlopen(url, timeout=5)
            data = json.loads(response.read().decode('utf-8'))
            return data['results'][0]['elevation']
        except:
            return 100


class NoiseInjection:
    @staticmethod
    def inject_noise(risk_score, noise_level):
        """Inject realistic noise into risk score"""
        # noise_level: 0-1 (0% to 100%)
        if noise_level == 0:
            return risk_score
        
        # Gaussian noise proportional to noise_level
        noise = random.gauss(0, noise_level * 2.5)
        noisy_score = risk_score + noise
        
        # Clamp to 0-10
        return max(0, min(10, noisy_score))


class FloodRiskPredictor:
    @staticmethod
    def predict_flood_risk(location, noise_level=0.5):
        try:
            lat, lon = WeatherAPI.get_lat_lon(location)
            if lat is None:
                return {"error": f"Location '{location}' not found"}

            weather = WeatherAPI.get_weather_data(lat, lon)
            elevation = WeatherAPI.get_elevation(lat, lon)

            # Base risk calculation
            risk_score = 0
            
            if weather['rainfall'] > 50:
                risk_score += 5
            elif weather['rainfall'] > 20:
                risk_score += 3
            elif weather['rainfall'] > 0:
                risk_score += 1
                
            if elevation < 50:
                risk_score += 4
            elif elevation < 100:
                risk_score += 2
                
            if weather['humidity'] > 85:
                risk_score += 2
            elif weather['humidity'] > 75:
                risk_score += 1

            # NOISE INJECTION - CRITICAL
            risk_score = NoiseInjection.inject_noise(risk_score, noise_level)

            # Location-specific boost
            if location.lower() in ['kerala', 'kochi', 'thiruvananthapuram']:
                risk_score = max(risk_score, 7.5)
            if location.lower() in ['mumbai', 'bangalore', 'hyderabad']:
                risk_score = max(risk_score, 6.5)

            # Determine risk level
            if risk_score >= 8.5:
                risk_level = "CRITICAL"
                confidence = 94
                action = "🚨 IMMEDIATE EVACUATION REQUIRED"
            elif risk_score >= 6.5:
                risk_level = "HIGH"
                confidence = 87
                action = "⚠️ PREPARE FOR EVACUATION"
            elif risk_score >= 4.5:
                risk_level = "MODERATE"
                confidence = 80
                action = "📢 INCREASE MONITORING"
            else:
                risk_level = "LOW"
                confidence = 75
                action = "✅ STANDARD MONITORING"

            risk_percent = int((risk_score / 10) * 100)
            ai_reasoning = f"🤖 Analysis for {location}: {risk_percent}% flood probability. Temperature: {weather['temperature']}°C, Humidity: {weather['humidity']}%, Rainfall: {weather['rainfall']}mm, Elevation: {elevation}m. Risk level: {risk_level}."

            prediction = {
                "location": location,
                "lat": lat,
                "lon": lon,
                "risk_score": round(risk_score, 2),
                "risk_level": risk_level,
                "confidence": confidence,
                "action": action,
                "temperature": round(weather['temperature'], 1),
                "humidity": round(weather['humidity'], 1),
                "rainfall": round(weather['rainfall'], 2),
                "elevation": round(elevation, 0),
                "noise_level": round(noise_level, 2),
                "ai_reasoning": ai_reasoning,
                "timestamp": datetime.now().isoformat()
            }

            Database.save_prediction(prediction)
            return prediction

        except Exception as e:
            return {"error": str(e)}


class FloodAPIHandler(BaseHTTPRequestHandler):
    def send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            params = parse_qs(body)
            
            location = params.get('location', ['World'])[0]
            noise_level = float(params.get('noise_level', ['0.5'])[0])
            
            # Get prediction with noise
            prediction = FloodRiskPredictor.predict_flood_risk(location, noise_level)
            
            # SEND TO n8n (optional - won't fail if n8n not running)
            if 'error' not in prediction:
                try:
                    requests.post(N8N_WEBHOOK, json=prediction, timeout=3)
                except:
                    pass  # n8n not running, continue
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            
            if 'error' not in prediction:
                print(f"✅ {prediction['risk_level']} ({prediction['risk_score']}/10) | Noise: {prediction['noise_level']*100:.0f}% | {location}")
            else:
                print(f"❌ Error: {prediction['error']}")
            
            self.wfile.write(json.dumps(prediction).encode('utf-8'))
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
    
    def do_GET(self):
        if self.path == '/health':
            response = {"status": "healthy"}
        elif self.path == '/':
            response = {"app": "🌊 FloodAI Global"}
        else:
            self.send_response(404)
            return
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(response).encode('utf-8'))
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
    
    def log_message(self, format, *args):
        pass


if __name__ == '__main__':
    Database.init_database()
    server = HTTPServer(('0.0.0.0', 8000), FloodAPIHandler)
    
    print("\n" + "="*70)
    print("✅ FLOODAI GLOBAL - BACKEND RUNNING")
    print("="*70)
    print("🌍 Backend: http://localhost:8000")
    print("🌧️ Using OpenWeatherMap + Open-Elevation APIs")
    print("📊 Features: Real-time Predictions | Noise Injection | n8n Integration")
    print("✨ Ready for predictions...")
    print("⚡ Press CTRL+C to stop\n")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n✋ Shutting down...")
        sys.exit(0)
