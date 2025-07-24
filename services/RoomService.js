const {
  RoomFactory,
  RoomType,
  LowSeasonStrategy,
  HighSeasonStrategy,
  PeakSeasonStrategy
} = require('../models/Room');

class RoomService {
  constructor() {
    this.rooms = [];
    this.pricingStrategies = {
      low: new LowSeasonStrategy(),
      high: new HighSeasonStrategy(),
      peak: new PeakSeasonStrategy()
    };
    this.initializeSampleRooms();
  }

  // Initialize sample rooms for testing
  initializeSampleRooms() {
    const sampleRooms = [
      { type: RoomType.SIMPLE, number: '101', basePrice: 50, occupancy: 1 },
      { type: RoomType.SIMPLE, number: '102', basePrice: 50, occupancy: 1 },
      { type: RoomType.DOUBLE, number: '201', basePrice: 80, occupancy: 2 },
      { type: RoomType.DOUBLE, number: '202', basePrice: 80, occupancy: 2 },
      { type: RoomType.EXECUTIVE, number: '301', basePrice: 120, occupancy: 2 },
      { type: RoomType.EXECUTIVE, number: '302', basePrice: 120, occupancy: 2 },
      { type: RoomType.SUITE, number: '401', basePrice: 200, occupancy: 4 },
      { type: RoomType.SUITE, number: '402', basePrice: 200, occupancy: 4 }
    ];

    sampleRooms.forEach(roomData => {
      const room = RoomFactory.createRoom(
        roomData.type,
        roomData.number,
        roomData.basePrice,
        roomData.occupancy
      );
      this.rooms.push(room);
    });
  }

  // Create a new room
  createRoom(roomData) {
    const { type, number, basePrice, occupancy } = roomData;


    // -- VALIDATIONS --
    // Validate room number uniqueness
    if (this.getRoomByNumber(number)) {
      throw new Error(`Room number ${number} already exists`);
    }

    // Validate room type
    if (!Object.values(RoomType).includes(type)) {
      throw new Error(`Invalid room type: ${type}`);
    }

    // Validate base price
    if (basePrice <= 0) {
      throw new Error('Base price must be greater than 0');
    }

    // -- CREATE ROOM --
    const room = RoomFactory.createRoom(type, number, basePrice, occupancy);
    this.rooms.push(room);

    return room;
  }

  // Get all rooms
  getAllRooms() {
    return this.rooms.map(room => room.toJSON());
  }

  // Get room by ID
  getRoomById(id) {
    const room = this.rooms.find(room => room.id === id);
    return room ? room.toJSON() : null;
  }

  // Get room by number
  getRoomByNumber(number) {
    const room = this.rooms.find(room => room.number === number);
    return room ? room.toJSON() : null;
  }

  // Update room
  updateRoom(id, updateData) {
    const room = this.rooms.find(room => room.id === id);
    if (!room) {
      throw new Error(`Room with ID ${id} not found`);
    }

    // Update allowed fields
    if (updateData.basePrice !== undefined) {
      if (updateData.basePrice <= 0) {
        throw new Error('Base price must be greater than 0');
      }
      room.basePrice = updateData.basePrice;
    }

    if (updateData.occupancy !== undefined) {
      if (updateData.occupancy <= 0) {
        throw new Error('Occupancy must be greater than 0');
      }
      room.occupancy = updateData.occupancy;
    }

    if (updateData.isAvailable !== undefined) {
      room.updateStatus(updateData.isAvailable);
    }

    room.updatedAt = new Date();
    return room.toJSON();
  }

  // Delete room
  deleteRoom(id) {
    const roomIndex = this.rooms.findIndex(room => room.id === id);
    if (roomIndex === -1) {
      throw new Error(`Room with ID ${id} not found`);
    }

    const room = this.rooms[roomIndex];
    this.rooms.splice(roomIndex, 1);
    return { message: `Room ${room.number} deleted successfully` };
  }

  // Get rooms by type
  getRoomsByType(type) {
    const rooms = this.rooms.filter(room =>
      room.constructor.name.toLowerCase() === type.toLowerCase()
    );
    return rooms.map(room => room.toJSON());
  }

  // Get available rooms
  getAvailableRooms() {
    const availableRooms = this.rooms.filter(room => room.isAvailable);
    return availableRooms.map(room => room.toJSON());
  }

  // Get occupied rooms
  getOccupiedRooms() {
    const occupiedRooms = this.rooms.filter(room => !room.isAvailable);
    return occupiedRooms.map(room => room.toJSON());
  }

  // Calculate room price with strategy
  calculateRoomPrice(roomId, season = 'low', dates = null) {
    const room = this.rooms.find(room => room.id === roomId);
    if (!room) {
      throw new Error(`Room with ID ${roomId} not found`);
    }

    const strategy = this.pricingStrategies[season] || this.pricingStrategies.low;
    return room.getPrice(strategy, dates);
  }

  // Update room availability
  updateRoomAvailability(roomId, isAvailable) {
    const room = this.rooms.find(room => room.id === roomId);
    if (!room) {
      throw new Error(`Room with ID ${roomId} not found`);
    }

    room.updateStatus(isAvailable);
    return room.toJSON();
  }

  // Get room statistics
  getRoomStatistics() {
    const stats = {
      total: this.rooms.length,
      available: this.rooms.filter(room => room.isAvailable).length,
      occupied: this.rooms.filter(room => !room.isAvailable).length,
      byType: {}
    };

    // Count by type
    Object.values(RoomType).forEach(type => {
      const typeRooms = this.getRoomsByType(type);
      stats.byType[type] = {
        total: typeRooms.length,
        available: typeRooms.filter(room => room.isAvailable).length,
        occupied: typeRooms.filter(room => !room.isAvailable).length
      };
    });

    return stats;
  }

  // Search rooms by criteria
  searchRooms(criteria) {
    let filteredRooms = this.rooms;

    // Filter by type
    if (criteria.type) {
      filteredRooms = filteredRooms.filter(room =>
        room.constructor.name.toLowerCase() === criteria.type.toLowerCase()
      );
    }

    // Filter by availability
    if (criteria.isAvailable !== undefined) {
      filteredRooms = filteredRooms.filter(room => room.isAvailable === criteria.isAvailable);
    }

    // Filter by price range
    if (criteria.minPrice !== undefined) {
      filteredRooms = filteredRooms.filter(room => room.basePrice >= criteria.minPrice);
    }

    if (criteria.maxPrice !== undefined) {
      filteredRooms = filteredRooms.filter(room => room.basePrice <= criteria.maxPrice);
    }

    // Filter by occupancy
    if (criteria.occupancy !== undefined) {
      filteredRooms = filteredRooms.filter(room => room.occupancy >= criteria.occupancy);
    }

    return filteredRooms.map(room => room.toJSON());
  }
}

module.exports = RoomService;
