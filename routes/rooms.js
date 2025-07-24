const express = require('express');
const router = express.Router();
const RoomService = require('../services/RoomService');

// Initialize room service
const roomService = new RoomService();

// GET /api/rooms/:id - Get room by ID
router.get('/:id', (req, res) => {
  try {
    const room = roomService.getRoomById(req.params.id);
    console.log(room);
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }
    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/rooms - Get all rooms
router.get('/', (req, res) => {
  try {
    const rooms = roomService.getAllRooms();
    console.log(rooms);
    res.json({
      success: true,
      data: rooms,
      count: rooms.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/rooms - Create new room
router.post('/', (req, res) => {
  try {
    const { type, number, basePrice, occupancy } = req.body;

    // Validate required fields
    if (!type || !number || !basePrice) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type, number, basePrice'
      });
    }

    const room = roomService.createRoom({
      type,
      number,
      basePrice: parseFloat(basePrice),
      occupancy: occupancy ? parseInt(occupancy) : 2
    });

    res.status(201).json({
      success: true,
      data: room.toJSON(),
      message: 'Room created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/rooms/:id - Update room
router.put('/:id', (req, res) => {
  try {
    const { basePrice, occupancy, isAvailable } = req.body;
    const updateData = {};

    if (basePrice !== undefined) updateData.basePrice = parseFloat(basePrice);
    if (occupancy !== undefined) updateData.occupancy = parseInt(occupancy);
    if (isAvailable !== undefined) updateData.isAvailable = Boolean(isAvailable);

    const room = roomService.updateRoom(req.params.id, updateData);

    res.json({
      success: true,
      data: room,
      message: 'Room updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE /api/rooms/:id - Delete room
router.delete('/:id', (req, res) => {
  try {
    const result = roomService.deleteRoom(req.params.id);
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/rooms/available - Get available rooms
router.get('/available', (req, res) => {
  try {
    const availableRooms = roomService.getAvailableRooms();
    res.json({
      success: true,
      data: availableRooms,
      count: availableRooms.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/rooms/occupied - Get occupied rooms
router.get('/occupied', (req, res) => {
  try {
    const occupiedRooms = roomService.getOccupiedRooms();
    res.json({
      success: true,
      data: occupiedRooms,
      count: occupiedRooms.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/rooms/type/:type - Get rooms by type
router.get('/type/:type', (req, res) => {
  try {
    const rooms = roomService.getRoomsByType(req.params.type);
    res.json({
      success: true,
      data: rooms,
      count: rooms.length,
      type: req.params.type
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/rooms/search - Search rooms by criteria
router.get('/search', (req, res) => {
  try {
    const { type, isAvailable, minPrice, maxPrice, occupancy } = req.query;
    const criteria = {};

    if (type) criteria.type = type;
    if (isAvailable !== undefined) criteria.isAvailable = isAvailable === 'true';
    if (minPrice) criteria.minPrice = parseFloat(minPrice);
    if (maxPrice) criteria.maxPrice = parseFloat(maxPrice);
    if (occupancy) criteria.occupancy = parseInt(occupancy);

    const rooms = roomService.searchRooms(criteria);
    res.json({
      success: true,
      data: rooms,
      count: rooms.length,
      criteria
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/rooms/:id/price - Calculate room price
router.get('/:id/price', (req, res) => {
  try {
    const { season = 'low', checkIn, checkOut } = req.query;
    const dates = checkIn && checkOut ? { checkIn, checkOut } : null;

    const price = roomService.calculateRoomPrice(req.params.id, season, dates);

    res.json({
      success: true,
      data: {
        roomId: req.params.id,
        season,
        price,
        dates
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/rooms/:id/availability - Update room availability
router.put('/:id/availability', (req, res) => {
  try {
    const { isAvailable } = req.body;

    if (isAvailable === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: isAvailable'
      });
    }

    const room = roomService.updateRoomAvailability(req.params.id, Boolean(isAvailable));

    res.json({
      success: true,
      data: room,
      message: `Room ${room.number} availability updated to ${isAvailable ? 'available' : 'occupied'}`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/rooms/stats/statistics - Get room statistics
router.get('/stats/statistics', (req, res) => {
  try {
    const stats = roomService.getRoomStatistics();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
