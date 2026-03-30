import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { fetchCarById, createBooking, getCarDetailRecommendations, fetchReviews, submitReview } from "../../services/api";
import BookingForm from "../../components/BookingForm.jsx";
import BookingConflictVisualizer from "../../components/BookingConflictVisualizer.jsx";
import CarAvailabilityVisualizer from "../../components/CarAvailabilityVisualizer.jsx";
import { AnimatePresence, motion } from "framer-motion";
import { 
  ArrowLeft, Users, Fuel, Gauge, ShieldCheck, CheckCircle, MapPin, Star, LogIn, X, CalendarDays
} from "lucide-react";

export default function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasUserBooking, setHasUserBooking] = useState(false);
  const [bookingInfo, setBookingInfo] = useState(null);
  const [relatedCars, setRelatedCars] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [isBookingWindowOpen, setIsBookingWindowOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  const location = useLocation();
  const fallbackImage = "https://images.unsplash.com/photo-1549399542-7e3f8b83ad38?w=800&h=450&fit=crop";

  useEffect(() => {
    setLoading(true);
    fetchCarById(id)
      .then((c) => setCar(c))
      .catch(() => setCar(null))
      .finally(() => setLoading(false));
      
    // Check if user is logged in
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setIsAdmin(storedUser?.role === "admin");

    const shouldOpenBookingWindow = Boolean(location.state?.openBookingWindow);
    if (shouldOpenBookingWindow && token) {
      setIsBookingWindowOpen(true);
    }

    // determine if user has a booking for this car (either via navigation state or past bookings)
    const navBooking = location.state && location.state.booking;
    if (navBooking) {
      setBookingInfo(navBooking);
      if ((navBooking.car && (navBooking.car._id === id || navBooking.car === id)) || navBooking.carId === id) {
        setHasUserBooking(true);
      }
    }

    if (!navBooking && isLoggedIn) {
      import("../../services/api").then(({ getMyBookings }) => {
        getMyBookings().then((list) => {
          const found = list.find((b) => (b.car && (b.car._id === id || b.car.id === id)) || b.carId === id);
          if (found) {
            setHasUserBooking(true);
            setBookingInfo(found);
          }
        });
      });
    }
  }, [id, isLoggedIn, location.state]);

  useEffect(() => {
    let isActive = true;

    setRelatedLoading(true);
    getCarDetailRecommendations(id)
      .then((data) => {
        if (!isActive) return;
        setRelatedCars(data?.recommendations || []);
      })
      .catch(() => {
        if (!isActive) return;
        setRelatedCars([]);
      })
      .finally(() => {
        if (isActive) setRelatedLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [id]);

  useEffect(() => {
    let isActive = true;

    setReviewsLoading(true);
    fetchReviews(id)
      .then((data) => {
        if (!isActive) return;
        setReviews(data || []);
      })
      .catch(() => {
        if (!isActive) return;
        setReviews([]);
      })
      .finally(() => {
        if (isActive) setReviewsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!isBookingWindowOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsBookingWindowOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isBookingWindowOpen]);


  function handleBooking(data) {
    if (!isLoggedIn) {
      alert("Please log in first to book a car");
      navigate("/login");
      return;
    }
    
    createBooking({ ...data, carId: id })
      .then((saved) => {
        setBookingSuccess(saved);
        setHasUserBooking(true);
        setBookingInfo(saved);
        setIsBookingWindowOpen(false);
        // Scroll to top to see success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch((err) => alert("Booking failed: " + err.message));
  }

  function handleReviewSubmit(e) {
    e.preventDefault();
    if (!isLoggedIn) {
      alert("Please log in to submit a review");
      navigate("/login");
      return;
    }

    setSubmittingReview(true);
    submitReview({
      carId: id,
      rating: reviewForm.rating,
      comment: reviewForm.comment
    })
      .then((newReview) => {
        setReviews([newReview, ...reviews]);
        setReviewForm({ rating: 5, comment: "" });
        setShowReviewForm(false);
      })
      .catch((err) => alert("Failed to submit review: " + err.message))
      .finally(() => setSubmittingReview(false));
  }

  // --- LOADING STATE ---
  if (loading) return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-pulse">
      <div className="h-8 bg-slate-200 w-32 rounded-lg"></div>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <div className="h-96 bg-slate-200 rounded-2xl"></div>
          <div className="h-8 bg-slate-200 w-1/2 rounded-lg"></div>
        </div>
        <div className="h-96 bg-slate-200 rounded-2xl"></div>
      </div>
    </div>
  );

  // --- ERROR STATE ---
  if (!car) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Car Not Found</h2>
      <Link to="/cars" className="text-sky-600 hover:underline flex items-center gap-2">
        <ArrowLeft size={16} /> Back to Listings
      </Link>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto px-4 py-8"
    >
      {/* Navigation */}
      <Link to="/cars" className="inline-flex items-center gap-2 text-slate-500 hover:text-sky-600 font-medium mb-6 transition-colors">
        <ArrowLeft size={20} />
        Back to Fleet
      </Link>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        
        {/* --- LEFT COLUMN: CAR DETAILS --- */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Main Image */}
          <div className="bg-white p-2 rounded-3xl shadow-sm border border-slate-100">
            <motion.img 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              src={car.img} 
              alt={`${car.make} ${car.model}`} 
              className="w-full h-[400px] object-cover rounded-2xl" 
            />
          </div>

          {/* Title & Price (Mobile Only View) */}
          <div className="md:hidden">
             <h1 className="text-3xl font-bold text-slate-800">{car.make} {car.model}</h1>
             {isAdmin ? (
               <p className="text-xl font-bold text-sky-600 mt-1">₹{car.pricePerDay} ... <span className="text-sm text-slate-400 font-normal">/ day</span></p>
             ) : (
               <p className="text-sm font-semibold text-sky-600 mt-1">Dynamic price shown after selecting dates</p>
             )}
          </div>

          {/* Specs Grid */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Vehicle Specifications</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              
              <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl text-center gap-2">
                <Users size={24} className="text-sky-600" />
                <span className="text-sm font-semibold text-slate-600">{car.seats} Passengers</span>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl text-center gap-2">
                <Gauge size={24} className="text-sky-600" />
                <span className="text-sm font-semibold text-slate-600">{car.transmission || "Automatic"}</span>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl text-center gap-2">
                <Fuel size={24} className="text-sky-600" />
                <span className="text-sm font-semibold text-slate-600">{car.fuelType || "Petrol"}</span>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl text-center gap-2">
                <ShieldCheck size={24} className="text-sky-600" />
                <span className="text-sm font-semibold text-slate-600">Full Insurance</span>
              </div>

              <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl text-center gap-2">
                <MapPin size={24} className="text-sky-600" />
                <span className="text-sm font-semibold text-slate-600">{car.location || "Unknown"}</span>
              </div>

            </div>

            <div className="mt-8 prose prose-slate text-slate-500">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Description</h3>
              <p>
                Experience the perfect blend of comfort and performance with this {car.make} {car.model}. 
                Ideal for both city driving and long highway trips, this vehicle comes equipped with modern 
                safety features, a spacious interior, and excellent fuel economy.
              </p>
              <ul className="mt-4 space-y-2 list-none pl-0">
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500"/> GPS Navigation System</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500"/> Bluetooth & Apple CarPlay</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500"/> 24/7 Roadside Assistance</li>
              </ul>

              {/* registration and owner info shown only after admin confirmation */}
              {bookingInfo?.status === "confirmed" && (
                <div className="mt-8 p-6 bg-slate-50 rounded-lg border-l-4 border-emerald-500">
                  <h3 className="text-lg font-bold text-slate-800 mb-2">✓ Access Details (Confirmed)</h3>
                  <p className="text-sm">
                    <strong>Registration Number:</strong> {car.regNumber || "N/A"}
                  </p>
                  {car.ownerName && (
                    <p className="text-sm">
                      <strong>Owner:</strong> {car.ownerName}
                    </p>
                  )}
                  {car.ownerPhone && (
                    <p className="text-sm">
                      <strong>Owner Phone:</strong> {car.ownerPhone}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Customer Reviews</h2>
              {isLoggedIn && !isAdmin && (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-4 py-2 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-500 transition-colors text-sm"
                >
                  {showReviewForm ? "Cancel" : "Write Review"}
                </button>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleReviewSubmit}
                className="mb-6 p-4 bg-slate-50 rounded-xl"
              >
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="text-2xl"
                      >
                        <Star
                          className={`${
                            star <= reviewForm.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Comment (Optional)</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:border-sky-300 focus:outline-none"
                    rows="3"
                    placeholder="Share your experience with this car..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-500 transition-colors disabled:opacity-50"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </motion.form>
            )}

            {/* Reviews List */}
            {reviewsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                      <div className="h-4 bg-slate-200 rounded w-24"></div>
                    </div>
                    <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b border-slate-100 pb-4 last:border-b-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-semibold text-sm">
                        {review.user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{review.user?.name || "Anonymous"}</div>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                className={`${
                                  star <= review.rating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-slate-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-slate-600 text-sm ml-11">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Star size={48} className="mx-auto mb-4 text-slate-300" />
                <p>No reviews yet. Be the first to review this car!</p>
              </div>
            )}
          </div>
        </div>

        {/* --- RIGHT COLUMN: BOOKING SIDEBAR --- */}
        <aside className="relative md:sticky md:top-24">
          
          {bookingSuccess ? (
            /* SUCCESS STATE CARD */
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-3xl shadow-xl shadow-emerald-100 border border-emerald-100 text-center"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                <CheckCircle size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Car is Reserved!</h2>
              <p className="text-slate-500 mb-6">Thank you for booking. Your reservation is confirmed.</p>
              
              <div className="bg-slate-50 p-4 rounded-xl text-left mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Booking ID</span>
                  <span className="font-mono font-bold text-slate-700">#{bookingSuccess._id ? bookingSuccess._id.toString().slice(-8) : 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Car</span>
                  <span className="font-semibold text-slate-700">{car.make} {car.model}</span>
                </div>
              </div>

              <Link 
                to="/bookings" 
                className="block w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors"
              >
                View My Bookings
              </Link>
            </motion.div>
          ) : !isLoggedIn ? (
            /* NOT LOGGED IN STATE */
            <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-3xl shadow-lg shadow-sky-100 border border-sky-200 text-center"
            >
              <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-6 text-sky-600">
                <LogIn size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Log In to Book</h2>
              <p className="text-slate-500 mb-6">You need to be logged in to reserve this vehicle.</p>
              
              <div className="space-y-3">
                <Link 
                  to="/login" 
                  className="block w-full py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold transition-colors"
                >
                  Log In
                </Link>
                <p className="text-sm text-slate-500">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-sky-600 font-semibold hover:underline">
                    Sign Up
                  </Link>
                </p>
              </div>
            </motion.div>

            {/* Availability visualizer visible even to non-logged-in visitors */}
            <CarAvailabilityVisualizer carId={car._id || car.id} />
            </div>

          ) : (
            /* BOOKING SUMMARY - LOGGED IN */
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">Booking</p>
                    <h1 className="text-2xl font-bold text-slate-800 mt-2">{car.make} {car.model}</h1>
                  </div>
                  <div className="text-right">
                    {isAdmin ? (
                      <>
                        <div className="text-3xl font-extrabold text-sky-600">₹{car.pricePerDay}</div>
                        <div className="text-xs text-slate-400 font-medium">/ day</div>
                      </>
                    ) : (
                      <div className="rounded-2xl bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700">
                        Dynamic price after dates
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 mt-3 text-amber-500 text-sm font-medium">
                  <Star size={16} fill="currentColor" /> 
                  <span>
                    {reviews.length > 0 
                      ? `${(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)} (${reviews.length} review${reviews.length !== 1 ? 's' : ''})`
                      : "No reviews yet"
                    }
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <div className="text-xs uppercase tracking-wide text-slate-400">Seats</div>
                    <div className="text-lg font-bold text-slate-800 mt-1">{car.seats || "-"}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <div className="text-xs uppercase tracking-wide text-slate-400">City</div>
                    <div className="text-lg font-bold text-slate-800 mt-1">{car.location || "Unknown"}</div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                      <CalendarDays size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Open booking in a separate window</h3>
                      <p className="text-sm text-slate-500 mt-1">Fill dates, address, pickup, and return details in a larger popup instead of the sidebar.</p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsBookingWindowOpen(true)}
                  className="mt-6 w-full rounded-2xl bg-sky-600 px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-sky-500"
                >
                  Open Booking Window
                </button>

                <p className="text-center text-xs text-slate-400 mt-3">
                  You won't be charged until pickup. Free cancellation up to 24h before.
                </p>
              </div>

              {/* Booking availability visualizer (admin only) */}
              {isAdmin && (
                <div className="mb-4">
                  <BookingConflictVisualizer carId={car._id || car.id} />
                </div>
              )}

              {/* Availability timeline for customers */}
              {!isAdmin && (
                <CarAvailabilityVisualizer carId={car._id || car.id} />
              )}
            </div>
          )}
        </aside>

      </div>

      <section className="mt-14">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Recommended next</p>
            <h2 className="text-2xl font-bold text-slate-800 mt-1">Three similar options to compare</h2>
            <p className="text-slate-500 mt-2">Based on this car&apos;s budget, seating, and pickup city.</p>
          </div>
        </div>

        {relatedLoading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-48 bg-slate-200"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-6 bg-slate-200 rounded w-2/3"></div>
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : relatedCars.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {relatedCars.map((recommendedCar) => (
              <motion.article
                key={recommendedCar._id || recommendedCar.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-sky-100 transition-shadow"
              >
                <img
                  src={recommendedCar.img || fallbackImage}
                  alt={`${recommendedCar.make} ${recommendedCar.model}`}
                  onError={(event) => {
                    event.currentTarget.src = fallbackImage;
                  }}
                  className="w-full h-52 object-cover"
                />

                <div className="p-6">
                  <div className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 mb-4">
                    {recommendedCar.recommendationTitle}
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">{recommendedCar.make} {recommendedCar.model}</h3>
                      <p className="text-sm text-slate-500 mt-1">{recommendedCar.year || "Latest model"}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-sky-600">₹{recommendedCar.pricePerDay}</div>
                      <div className="text-xs text-slate-400">/ day</div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 mt-4 min-h-[48px]">{recommendedCar.recommendationReason}</p>

                  <div className="grid grid-cols-2 gap-3 mt-5">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Users size={16} className="text-sky-600" />
                        <span>{recommendedCar.seats || "-"} seats</span>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <MapPin size={16} className="text-sky-600" />
                        <span>{recommendedCar.location || "Unknown"}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/cars/${recommendedCar._id || recommendedCar.id}`}
                    className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-500"
                  >
                    View this car
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        ) : null}
      </section>

      <AnimatePresence>
        {isLoggedIn && isBookingWindowOpen && !bookingSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-sm px-4 py-6 md:px-8"
            onClick={() => setIsBookingWindowOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 12 }}
              transition={{ duration: 0.2 }}
              className="mx-auto flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 md:px-8">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">Booking window</p>
                  <h2 className="text-2xl font-bold text-slate-800 mt-2">Reserve {car.make} {car.model}</h2>
                  <p className="text-sm text-slate-500 mt-1">More space for dates, pickup, return, and pricing without crowding the detail page.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBookingWindowOpen(false)}
                  className="shrink-0 rounded-2xl p-3 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                  aria-label="Close booking window"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid gap-0 overflow-y-auto md:grid-cols-[1.05fr_1.95fr]">
                <div className="border-b border-slate-100 bg-slate-50/80 p-6 md:border-b-0 md:border-r md:p-8">
                  <img
                    src={car.img || fallbackImage}
                    alt={`${car.make} ${car.model}`}
                    onError={(event) => {
                      event.currentTarget.src = fallbackImage;
                    }}
                    className="h-52 w-full rounded-3xl object-cover"
                  />

                  <div className="mt-5">
                    <h3 className="text-2xl font-bold text-slate-800">{car.make} {car.model}</h3>
                    <p className="text-sm text-slate-500 mt-1">{car.location || "Unknown city"}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                      <div className="text-xs uppercase tracking-wide text-slate-400">Seats</div>
                      <div className="text-lg font-bold text-slate-800 mt-1">{car.seats || "-"}</div>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                      <div className="text-xs uppercase tracking-wide text-slate-400">Fuel</div>
                      <div className="text-lg font-bold text-slate-800 mt-1 capitalize">{car.fuelType || "Petrol"}</div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-slate-400">Pricing</div>
                    {isAdmin ? (
                      <div className="mt-2 text-3xl font-extrabold text-sky-600">₹{car.pricePerDay}<span className="text-sm font-medium text-slate-400"> / day</span></div>
                    ) : (
                      <div className="mt-2 text-sm font-semibold text-sky-700">Dynamic price appears after you pick dates.</div>
                    )}
                    <p className="text-sm text-slate-500 mt-3">Pickup and return will default to {car.location || "the car city"}, and you can adjust the exact addresses in the form.</p>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <BookingForm car={car} onSubmit={handleBooking} variant="modal" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}