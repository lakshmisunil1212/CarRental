// Run with: node seedReviews.js
require("dotenv").config();
const mongoose = require("mongoose");
const Review = require("../models/Review");
const Car = require("../models/Car");
const User = require("../models/User");

// Comprehensive dummy review data
const dummyReviewTemplates = [
  {
    rating: 5,
    comment: "Excellent car! Very clean and well maintained. The owner was very responsive and the booking process was smooth."
  },
  {
    rating: 4,
    comment: "Good experience overall. Car was in great condition and fuel efficiency was better than expected."
  },
  {
    rating: 5,
    comment: "Highly recommended! The car was spotless and had all the features mentioned. Will definitely book again."
  },
  {
    rating: 3,
    comment: "Decent car but had some minor scratches. Overall satisfactory experience."
  },
  {
    rating: 4,
    comment: "Very comfortable ride. AC was working perfectly and the car was clean inside out."
  },
  {
    rating: 5,
    comment: "Amazing service! Car was delivered on time and pickup was hassle-free. Highly satisfied."
  },
  {
    rating: 4,
    comment: "Good value for money. Car performed well on highway and city driving."
  },
  {
    rating: 5,
    comment: "Perfect car for our family trip. Spacious, comfortable and fuel-efficient."
  },
  {
    rating: 3,
    comment: "Car was okay but could be cleaner. Minor issues with the stereo but nothing major."
  },
  {
    rating: 4,
    comment: "Great experience! The owner provided clear instructions and the car was ready as promised."
  },
  {
    rating: 5,
    comment: "Outstanding service! This is my third booking with this car and it never disappoints."
  },
  {
    rating: 4,
    comment: "Very reliable car. Had no issues during the entire rental period."
  },
  {
    rating: 5,
    comment: "Exceptional quality! Felt like driving a brand new car. Highly recommended."
  },
  {
    rating: 3,
    comment: "Average experience. Car was functional but not as described in some aspects."
  },
  {
    rating: 4,
    comment: "Good car with excellent mileage. Perfect for long distance travel."
  },
  {
    rating: 5,
    comment: "Fantastic car! Exceeded all expectations. The owner went above and beyond."
  },
  {
    rating: 4,
    comment: "Solid performance and great comfort. Minor wear and tear but nothing concerning."
  },
  {
    rating: 5,
    comment: "Best rental experience ever! Car was immaculate and service was top-notch."
  },
  {
    rating: 3,
    comment: "Car served its purpose but had some maintenance issues that needed attention."
  },
  {
    rating: 4,
    comment: "Very satisfied with the rental. Car was clean and pickup/dropoff was convenient."
  }
];

const dummyUserNames = [
  "Rajesh Kumar", "Priya Sharma", "Amit Patel", "Sneha Gupta", "Vikram Singh",
  "Kavita Reddy", "Rohit Jain", "Meera Iyer", "Arun Kumar", "Divya Menon",
  "Suresh Babu", "Anjali Desai", "Manoj Tiwari", "Poonam Joshi", "Rahul Verma",
  "Sunita Agarwal", "Deepak Sharma", "Neha Singh", "Vivek Gupta", "Kiran Patel"
];

async function seedReviews() {
  try {
    // Connect to database
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/rentalapp";
    await mongoose.connect(mongoUri);

    console.log("Seeding reviews...");

    // Get ALL cars
    const cars = await Car.find({});
    console.log(`Found ${cars.length} cars in database`);

    // Get or create customer users
    let customerUsers = await User.find({ role: "user" });
    if (customerUsers.length === 0) {
      console.log("No customer users found. Creating dummy customer users...");
      const dummyCustomers = [
        { name: "Rajesh Kumar", email: "rajesh@example.com", password: "hashedpassword", role: "user", phone: "+91-9876543210" },
        { name: "Priya Sharma", email: "priya@example.com", password: "hashedpassword", role: "user", phone: "+91-9876543211" },
        { name: "Amit Patel", email: "amit@example.com", password: "hashedpassword", role: "user", phone: "+91-9876543212" }
      ];
      customerUsers = await User.insertMany(dummyCustomers);
      console.log("Created dummy customer users");
    }

    // Clear existing reviews
    await Review.deleteMany({});
    console.log("Cleared existing reviews");

    const reviewsToCreate = [];

    // Create 2-5 reviews for each car
    for (const car of cars) {
      const numReviews = Math.floor(Math.random() * 4) + 2; // 2-5 reviews per car

      // Shuffle review templates and select random ones
      const shuffledTemplates = [...dummyReviewTemplates].sort(() => Math.random() - 0.5);
      const selectedTemplates = shuffledTemplates.slice(0, numReviews);

      for (const template of selectedTemplates) {
        const randomUser = customerUsers[Math.floor(Math.random() * customerUsers.length)];
        const randomUserName = dummyUserNames[Math.floor(Math.random() * dummyUserNames.length)];

        reviewsToCreate.push({
          car: car._id,
          user: randomUser._id,
          rating: template.rating,
          comment: template.comment,
          userName: randomUserName
        });
      }
    }

    // Insert all reviews
    await Review.insertMany(reviewsToCreate);
    console.log(`Successfully created ${reviewsToCreate.length} dummy reviews!`);

    // Show summary statistics
    const totalReviews = await Review.countDocuments();
    console.log(`\nTotal reviews in database: ${totalReviews}`);

    // Calculate and display average ratings per car
    console.log("\nAverage ratings per car:");
    for (const car of cars) {
      const carReviews = await Review.find({ car: car._id });
      if (carReviews.length > 0) {
        const avgRating = carReviews.reduce((sum, r) => sum + r.rating, 0) / carReviews.length;
        console.log(`  ${car.make} ${car.model}: ${carReviews.length} reviews, avg rating: ${avgRating.toFixed(1)}`);
      } else {
        console.log(`  ${car.make} ${car.model}: No reviews`);
      }
    }

  } catch (error) {
    console.error("Error seeding reviews:", error);
  } finally {
    await mongoose.connection.close();
  }
}

// Run if called directly
if (require.main === module) {
  seedReviews();
}

module.exports = seedReviews;