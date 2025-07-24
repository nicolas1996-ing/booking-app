const { v4: uuidv4 } = require('uuid');

// Room types enum
const RoomType = {
  SIMPLE: 'simple',
  DOUBLE: 'double',
  EXECUTIVE: 'executive',
  SUITE: 'suite'
};

// Pricing Strategy Interface
class IPricingStrategy {
  calculatePrice(basePrice, dates) {
    throw new Error('calculatePrice method must be implemented');
  }
}

// Concrete pricing strategies
class LowSeasonStrategy extends IPricingStrategy {
  calculatePrice(basePrice, dates) {
    return basePrice; // No additional charge
  }
}

class HighSeasonStrategy extends IPricingStrategy {
  calculatePrice(basePrice, dates) {
    return basePrice * 1.3; // 30% increase
  }
}

class PeakSeasonStrategy extends IPricingStrategy {
  calculatePrice(basePrice, dates) {
    return basePrice * 1.6; // 60% increase
  }
}

// Room Factory
class RoomFactory {
  static createRoom(type, number, basePrice, occupancy = 2) {
    switch (type) {
      case RoomType.SIMPLE:
        return new SimpleRoom(number, basePrice, occupancy);
      case RoomType.DOUBLE:
        return new DoubleRoom(number, basePrice, occupancy);
      case RoomType.EXECUTIVE:
        return new ExecutiveRoom(number, basePrice, occupancy);
      case RoomType.SUITE:
        return new SuiteRoom(number, basePrice, occupancy);
      default:
        throw new Error(`Invalid room type: ${type}`);
    }
  }
}

// Abstract Room class
class Room {
  constructor(number, basePrice, occupancy) {
    this.id = uuidv4();
    this.number = number;
    this.basePrice = basePrice;
    this.occupancy = occupancy;
    this.isAvailable = true;
    this.amenities = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  getPrice(strategy = new LowSeasonStrategy(), dates = null) {
    return strategy.calculatePrice(this.basePrice, dates);
  }

  updateStatus(available) {
    this.isAvailable = available;
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      number: this.number,
      type: this.constructor.name,
      basePrice: this.basePrice,
      occupancy: this.occupancy,
      isAvailable: this.isAvailable,
      amenities: this.amenities,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

// Concrete room classes
class SimpleRoom extends Room {
  constructor(number, basePrice, occupancy = 1) {
    super(number, basePrice, occupancy);
    this.amenities = ['TV', 'WiFi', 'Private Bathroom'];
  }
}

class DoubleRoom extends Room {
  constructor(number, basePrice, occupancy = 2) {
    super(number, basePrice, occupancy);
    this.amenities = ['TV', 'WiFi', 'Private Bathroom', 'Two Beds'];
  }
}

class ExecutiveRoom extends Room {
  constructor(number, basePrice, occupancy = 2) {
    super(number, basePrice, occupancy);
    this.amenities = ['TV', 'WiFi', 'Private Bathroom', 'King Bed', 'Work Desk', 'Mini Bar'];
  }
}

class SuiteRoom extends Room {
  constructor(number, basePrice, occupancy = 4) {
    super(number, basePrice, occupancy);
    this.amenities = ['TV', 'WiFi', 'Private Bathroom', 'King Bed', 'Living Room', 'Mini Bar', 'Balcony'];
  }
}

module.exports = {
  Room,
  SimpleRoom,
  DoubleRoom,
  ExecutiveRoom,
  SuiteRoom,
  RoomFactory,
  RoomType,
  IPricingStrategy,
  LowSeasonStrategy,
  HighSeasonStrategy,
  PeakSeasonStrategy
};
