### Installation

1. **Clone and navigate to the project:**
```bash
cd reservas-de-hotel
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Access the API:**
- Base URL: `http://localhost:3000`
- Health Check: `http://localhost:3000/health`

## 📋 API Endpoints

### Room Management

#### Get All Rooms
```http
GET /api/rooms
```

#### Get Room by ID
```http
GET /api/rooms/:id
```

#### Create New Room
```http
POST /api/rooms
Content-Type: application/json

{
  "type": "simple",
  "number": "103",
  "basePrice": 60,
  "occupancy": 2
}
```

#### Update Room
```http
PUT /api/rooms/:id
Content-Type: application/json

{
  "basePrice": 70,
  "isAvailable": true
}
```

#### Delete Room
```http
DELETE /api/rooms/:id
```

#### Get Available Rooms
```http
GET /api/rooms/available
```

#### Get Occupied Rooms
```http
GET /api/rooms/occupied
```

#### Get Rooms by Type
```http
GET /api/rooms/type/simple
```

#### Search Rooms
```http
GET /api/rooms/search?type=double&minPrice=50&maxPrice=100&isAvailable=true
```

#### Get Room Price
```http
GET /api/rooms/:id/price?season=high
```

#### Update Room Availability
```http
PUT /api/rooms/:id/availability
Content-Type: application/json

{
  "isAvailable": false
}
```

#### Room Statistics
```http
GET /api/rooms/stats/statistics
```
