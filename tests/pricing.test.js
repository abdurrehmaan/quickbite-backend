import { calculateDeliveryFee } from '../src/pricing/pricingEngine.js';
import { getDistanceKm } from '../src/pricing/distanceService.js';
import { getZonePricing } from '../src/pricing/zonePricing.js';
import { getPeakMultiplier } from '../src/pricing/peakService.js';

jest.mock('../src/pricing/distanceService.js');
jest.mock('../src/pricing/zonePricing.js');
jest.mock('../src/pricing/peakService.js');

describe('Pricing Engine', () => {
  const mockCustomer = {
    location: { lat: 40.7128, lon: -74.0060 },
    zone: 'zone_1'
  };

  const mockRestaurant = {
    location: { lat: 40.7589, lon: -73.9851 }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should calculate delivery fee correctly', async () => {
    getDistanceKm.mockReturnValue(5);
    getZonePricing.mockResolvedValue({ baseFee: 2, perKmRate: 0.5 });
    getPeakMultiplier.mockReturnValue(1.2);

    const placedAt = new Date('2025-12-04T18:00:00Z');
    const result = await calculateDeliveryFee(mockCustomer, mockRestaurant, placedAt);

    expect(result.distance).toBe(5);
    expect(result.zoneBaseFee).toBe(2);
    expect(result.perKmRate).toBe(0.5);
    expect(result.peakMultiplier).toBe(1.2);
    expect(result.deliveryFee).toBe((2 + 5 * 0.5) * 1.2); // (2 + 2.5) * 1.2 = 5.4
  });

  test('should handle zero distance', async () => {
    getDistanceKm.mockReturnValue(0);
    getZonePricing.mockResolvedValue({ baseFee: 2, perKmRate: 0.5 });
    getPeakMultiplier.mockReturnValue(1);

    const result = await calculateDeliveryFee(mockCustomer, mockRestaurant, new Date());

    expect(result.deliveryFee).toBe(2); // Only base fee
  });

  test('should apply peak multiplier correctly', async () => {
    getDistanceKm.mockReturnValue(10);
    getZonePricing.mockResolvedValue({ baseFee: 3, perKmRate: 1 });
    getPeakMultiplier.mockReturnValue(1.5);

    const result = await calculateDeliveryFee(mockCustomer, mockRestaurant, new Date());

    expect(result.deliveryFee).toBe((3 + 10) * 1.5); // 19.5
  });
});
