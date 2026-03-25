const DEFAULT_COORDS = { latitude: 12.9716, longitude: 77.5946 }; // Bengaluru fallback

const CITY_COORDS = {
  kannur: { latitude: 11.8745, longitude: 75.3704 },
  kochi: { latitude: 9.9312, longitude: 76.2673 },
  kozhikode: { latitude: 11.2588, longitude: 75.7804 },
  trivandrum: { latitude: 8.5241, longitude: 76.9366 },
  bangalore: { latitude: 12.9716, longitude: 77.5946 },
  bengaluru: { latitude: 12.9716, longitude: 77.5946 },
  chennai: { latitude: 13.0827, longitude: 80.2707 },
  mumbai: { latitude: 19.076, longitude: 72.8777 },
  delhi: { latitude: 28.6139, longitude: 77.209 },
  hyderabad: { latitude: 17.385, longitude: 78.4867 },
};

function getCoords(locationText = "") {
  const key = String(locationText).trim().toLowerCase();
  return CITY_COORDS[key] || DEFAULT_COORDS;
}

function weatherMultiplierFromCode(code) {
  // Open-Meteo weather codes: rain/storm generally increase immediate demand.
  if ([61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) return 1.08;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 1.05;
  if ([0, 1].includes(code)) return 0.99;
  return 1.0;
}

async function getWeatherFactor(locationText) {
  try {
    const { latitude, longitude } = getCoords(locationText);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=weather_code`;
    const resp = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!resp.ok) return { weatherFactor: 1.0, weatherCode: null };
    const data = await resp.json();
    const code = data?.current?.weather_code;
    if (typeof code !== "number") return { weatherFactor: 1.0, weatherCode: null };
    return { weatherFactor: weatherMultiplierFromCode(code), weatherCode: code };
  } catch {
    return { weatherFactor: 1.0, weatherCode: null };
  }
}

function getTimeOfDayFactor(now = new Date()) {
  const hour = now.getHours();
  const day = now.getDay();
  const isWeekend = day === 0 || day === 6;

  let factor = 1.0;
  if (hour >= 17 && hour <= 21) factor += 0.08;
  else if (hour >= 7 && hour <= 10) factor += 0.05;
  if (isWeekend) factor += 0.07;

  return Math.min(1.2, factor);
}

function overlaps(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

async function calculateDynamicPricing({ Booking, car, pickupDate, returnDate, now = new Date() }) {
  const basePricePerDay = Number(car?.pricePerDay || 0);
  const start = new Date(pickupDate);
  const end = new Date(returnDate);
  const msPerDay = 24 * 60 * 60 * 1000;
  const days = Math.max(1, Math.ceil((end - start) / msPerDay));

  // Car-specific demand in requested window
  const carBookings = await Booking.find({ car: car._id, status: { $in: ["pending", "confirmed", "active"] } })
    .select("pickupDate returnDate");
  const overlappingCount = carBookings.filter((b) => overlaps(start, end, new Date(b.pickupDate), new Date(b.returnDate))).length;
  const carDemandFactor = Math.min(1.35, 1 + overlappingCount * 0.04);

  // Location demand: bookings starting in next 7 days in same location
  const weekEnd = new Date(now.getTime() + 7 * msPerDay);
  const locationBookings = await Booking.find({
    status: { $in: ["pending", "confirmed", "active"] },
    pickupDate: { $gte: now, $lte: weekEnd },
  }).populate("car", "location");
  const locationDemandCount = locationBookings.filter((b) => b.car?.location === car.location).length;
  const locationDemandFactor = Math.min(1.2, 1 + locationDemandCount * 0.01);

  const { weatherFactor, weatherCode } = await getWeatherFactor(car.location);
  const timeOfDayFactor = getTimeOfDayFactor(now);

  const combinedFactor = Math.max(
    0.8,
    Math.min(1.8, carDemandFactor * locationDemandFactor * weatherFactor * timeOfDayFactor)
  );

  const dynamicPricePerDay = Math.round(basePricePerDay * combinedFactor);
  const totalPrice = dynamicPricePerDay * days;

  return {
    basePricePerDay,
    dynamicPricePerDay,
    days,
    totalPrice,
    factors: {
      carDemandFactor,
      locationDemandFactor,
      weatherFactor,
      timeOfDayFactor,
      combinedFactor,
      overlappingCount,
      locationDemandCount,
      weatherCode,
    },
  };
}

module.exports = { calculateDynamicPricing };