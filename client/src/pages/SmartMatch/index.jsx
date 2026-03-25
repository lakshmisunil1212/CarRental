import React, { useEffect, useState } from "react";
import { Sparkles, MapPin, IndianRupee, Brain, ThumbsUp, ThumbsDown } from "lucide-react";
import { Link } from "react-router-dom";
import { getSmartCarRecommendations, submitRecommendationFeedback } from "../../services/api";

export default function SmartMatchPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);
  const [feedback, setFeedback] = useState({ usefulCount: 0, notUsefulCount: 0 });
  const [recommendations, setRecommendations] = useState([]);
  const [feedbackStatus, setFeedbackStatus] = useState("");

  useEffect(() => {
    let mounted = true;
    getSmartCarRecommendations()
      .then((data) => {
        if (!mounted) return;
        setProfile(data.profile || null);
        setFeedback(data.feedback || { usefulCount: 0, notUsefulCount: 0 });
        setRecommendations(data.recommendations || []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || "Unable to load recommendations");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div className="max-w-6xl mx-auto p-6">Generating smart matches...</div>;
  }

  const handleFeedback = async (isUseful) => {
    try {
      setFeedbackStatus("Saving feedback...");
      const data = await submitRecommendationFeedback(isUseful);
      setFeedback(data.recommendationFeedback || feedback);
      setFeedbackStatus("Thanks! We updated your recommendation model.");
      setTimeout(() => setFeedbackStatus(""), 1800);
    } catch (err) {
      setFeedbackStatus(err.message || "Could not save feedback");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="rounded-2xl border border-sky-100 bg-gradient-to-r from-cyan-50 to-white p-6 mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
          <Brain size={24} className="text-cyan-700" /> Smart Car Matching
        </h1>
        <p className="text-slate-600 mt-2">
          Personalized recommendations based on your booking behavior and preferences.
        </p>
        {profile && (
          <div className="mt-4 text-sm text-slate-700 flex flex-wrap gap-2">
            {profile.topMake && <span className="px-3 py-1 bg-white rounded-full border">Preferred make: {profile.topMake}</span>}
            {profile.topLocation && <span className="px-3 py-1 bg-white rounded-full border">Frequent location: {profile.topLocation}</span>}
            {typeof profile.avgPrice === "number" && (
              <span className="px-3 py-1 bg-white rounded-full border">Typical budget: INR {Math.round(profile.avgPrice)}/day</span>
            )}
            {profile.preferences?.preferredTransmission && (
              <span className="px-3 py-1 bg-white rounded-full border">Transmission: {profile.preferences.preferredTransmission}</span>
            )}
            {profile.preferences?.preferredFuelType && (
              <span className="px-3 py-1 bg-white rounded-full border">Fuel: {profile.preferences.preferredFuelType}</span>
            )}
            {profile.preferences?.preferredSeats && (
              <span className="px-3 py-1 bg-white rounded-full border">Seats: {profile.preferences.preferredSeats}+</span>
            )}
          </div>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500">Was this recommendation set useful?</span>
          <button onClick={() => handleFeedback(true)} className="px-3 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700 font-semibold inline-flex items-center gap-1"><ThumbsUp size={12} /> Yes</button>
          <button onClick={() => handleFeedback(false)} className="px-3 py-1 rounded-full text-xs bg-rose-100 text-rose-700 font-semibold inline-flex items-center gap-1"><ThumbsDown size={12} /> No</button>
          <span className="text-xs text-slate-500">Useful: {feedback.usefulCount} | Not useful: {feedback.notUsefulCount}</span>
        </div>
        {feedbackStatus && <div className="mt-2 text-xs text-slate-600">{feedbackStatus}</div>}
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {recommendations.map((car) => (
          <div key={car._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {(car.imageUrl || car.img) && <img src={car.imageUrl || car.img} alt={`${car.make} ${car.model}`} className="h-44 w-full object-cover" />}
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-bold text-slate-800">{car.make} {car.model}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-cyan-100 text-cyan-800 font-semibold">
                  Score {car.matchScore}
                </span>
              </div>
              <div className="mt-2 text-sm text-slate-600 flex items-center gap-2"><MapPin size={14} /> {car.location || "N/A"}</div>
              <div className="mt-1 text-sm text-slate-600 flex items-center gap-2"><IndianRupee size={14} /> {car.pricePerDay}/day</div>

              <ul className="mt-3 space-y-1">
                {(car.matchReasons || []).slice(0, 3).map((reason, idx) => (
                  <li key={idx} className="text-xs text-slate-600 flex items-center gap-1">
                    <Sparkles size={12} className="text-cyan-700" /> {reason}
                  </li>
                ))}
              </ul>

              <Link
                to={`/cars/${car._id}`}
                className="inline-block mt-4 text-sm font-semibold text-white bg-cyan-700 hover:bg-cyan-600 px-4 py-2 rounded-lg"
              >
                View Car
              </Link>
            </div>
          </div>
        ))}
      </div>

      {recommendations.length === 0 && !error && (
        <div className="text-slate-600">No recommendations yet. Book a few cars to train your matching profile.</div>
      )}
    </div>
  );
}