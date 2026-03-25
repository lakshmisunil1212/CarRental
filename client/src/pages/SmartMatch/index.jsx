import React, { useEffect, useState } from "react";
import { Sparkles, MapPin, IndianRupee, Brain, ThumbsUp, ThumbsDown } from "lucide-react";
import { Link } from "react-router-dom";
import { getSmartCarRecommendations, submitRecommendationFeedback, submitRecommendationItemFeedback, submitColdStartQuiz } from "../../services/api";

export default function SmartMatchPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);
  const [feedback, setFeedback] = useState({ usefulCount: 0, notUsefulCount: 0 });
  const [recommendations, setRecommendations] = useState([]);
  const [feedbackStatus, setFeedbackStatus] = useState("");
  const [activeFeedbackId, setActiveFeedbackId] = useState(null);
  const [isColdStart, setIsColdStart] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizOptions, setQuizOptions] = useState({ locations: [] });
  const [confidence, setConfidence] = useState({ level: "low", score: 0 });
  const [alternatives, setAlternatives] = useState({ cheaperOptions: [], premiumOptions: [] });
  const [quizForm, setQuizForm] = useState({
    preferredTransmission: "automatic",
    preferredFuelType: "petrol",
    preferredSeats: 5,
    preferredLocation: "any",
    budgetBand: "balanced",
    tripType: "city",
  });

  useEffect(() => {
    let mounted = true;
    getSmartCarRecommendations()
      .then((data) => {
        if (!mounted) return;
        setProfile(data.profile || null);
        setFeedback(data.feedback || { usefulCount: 0, notUsefulCount: 0 });
        setRecommendations(data.recommendations || []);
        setIsColdStart(Boolean(data.isColdStart));
        setQuizOptions(data.quizOptions || { locations: [] });
        setConfidence(data.confidence || { level: "low", score: 0 });
        setAlternatives(data.alternatives || { cheaperOptions: [], premiumOptions: [] });
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

  const handleItemFeedback = async (carId, sentiment) => {
    try {
      setActiveFeedbackId(`${carId}:${sentiment}`);
      setFeedbackStatus(sentiment === "like" ? "Saving: more like this..." : "Saving: less like this...");
      const data = await submitRecommendationItemFeedback(carId, sentiment);
      setRecommendations(data.recommendations || recommendations);
      setFeedback(data.recommendationFeedback || feedback);
      setConfidence(data.confidence || confidence);
      setAlternatives(data.alternatives || alternatives);
      setFeedbackStatus(data.message || "Feedback saved");
      setTimeout(() => setFeedbackStatus(""), 2200);
    } catch (err) {
      setFeedbackStatus(err.message || "Could not save feedback");
    } finally {
      setActiveFeedbackId(null);
    }
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    try {
      setQuizLoading(true);
      setFeedbackStatus("Applying your preferences...");
      const data = await submitColdStartQuiz(quizForm);
      setProfile(data.profile || profile);
      setFeedback(data.feedback || feedback);
      setRecommendations(data.recommendations || recommendations);
      setConfidence(data.confidence || confidence);
      setAlternatives(data.alternatives || alternatives);
      setIsColdStart(false);
      setFeedbackStatus("Smart Match is now personalized for your profile.");
      setTimeout(() => setFeedbackStatus(""), 2400);
    } catch (err) {
      setFeedbackStatus(err.message || "Could not apply quiz preferences");
    } finally {
      setQuizLoading(false);
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
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-700">
          Match Confidence: {confidence.level.toUpperCase()} ({confidence.score})
        </div>
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

      {isColdStart && (
        <div className="mb-6 bg-white border border-cyan-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Quick Preference Quiz</h2>
          <p className="text-sm text-slate-500 mb-5">Answer these 5 quick questions to generate better first-time matches.</p>
          <form onSubmit={handleQuizSubmit} className="grid md:grid-cols-2 gap-4">
            <label className="text-sm font-medium text-slate-700">
              Transmission
              <select
                value={quizForm.preferredTransmission}
                onChange={(e) => setQuizForm((prev) => ({ ...prev, preferredTransmission: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
                <option value="any">No preference</option>
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Fuel Type
              <select
                value={quizForm.preferredFuelType}
                onChange={(e) => setQuizForm((prev) => ({ ...prev, preferredFuelType: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="cng">CNG</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
                <option value="any">No preference</option>
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Minimum Seats Needed
              <select
                value={quizForm.preferredSeats}
                onChange={(e) => setQuizForm((prev) => ({ ...prev, preferredSeats: Number(e.target.value) }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
              >
                {[4, 5, 6, 7, 8].map((seats) => (
                  <option key={seats} value={seats}>{seats}+</option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Preferred Area
              <select
                value={quizForm.preferredLocation}
                onChange={(e) => setQuizForm((prev) => ({ ...prev, preferredLocation: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <option value="any">No preference</option>
                {(quizOptions.locations || []).map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Budget Style
              <select
                value={quizForm.budgetBand}
                onChange={(e) => setQuizForm((prev) => ({ ...prev, budgetBand: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <option value="budget">Budget friendly</option>
                <option value="balanced">Balanced</option>
                <option value="premium">Premium</option>
                <option value="any">No preference</option>
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Trip Type
              <select
                value={quizForm.tripType}
                onChange={(e) => setQuizForm((prev) => ({ ...prev, tripType: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <option value="city">City drive</option>
                <option value="family">Family trip</option>
                <option value="business">Business travel</option>
                <option value="highway">Highway/long drive</option>
                <option value="any">No preference</option>
              </select>
            </label>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={quizLoading}
                className="px-5 py-2.5 rounded-xl bg-cyan-700 text-white font-semibold hover:bg-cyan-600 disabled:opacity-60"
              >
                {quizLoading ? "Generating matches..." : "Generate Smart Matches"}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && <div className="mb-4 text-red-600">{error}</div>}

      {(alternatives.cheaperOptions?.length > 0 || alternatives.premiumOptions?.length > 0) && (
        <div className="mb-6 grid md:grid-cols-2 gap-4">
          <div className="bg-white border border-emerald-200 rounded-2xl p-4">
            <h3 className="text-base font-bold text-emerald-700">Similar Cheaper Alternatives</h3>
            <div className="mt-3 space-y-2">
              {(alternatives.cheaperOptions || []).map((car) => (
                <Link key={`cheap-${car._id}`} to={`/cars/${car._id}`} className="block p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors">
                  <div className="font-semibold text-slate-800">{car.make} {car.model}</div>
                  <div className="text-xs text-slate-600">{car.location || "N/A"} | INR {car.pricePerDay}/day</div>
                </Link>
              ))}
              {alternatives.cheaperOptions?.length === 0 && <div className="text-xs text-slate-500">No cheaper alternatives available in current top matches.</div>}
            </div>
          </div>
          <div className="bg-white border border-indigo-200 rounded-2xl p-4">
            <h3 className="text-base font-bold text-indigo-700">Premium Upgrade Picks</h3>
            <div className="mt-3 space-y-2">
              {(alternatives.premiumOptions || []).map((car) => (
                <Link key={`premium-${car._id}`} to={`/cars/${car._id}`} className="block p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors">
                  <div className="font-semibold text-slate-800">{car.make} {car.model}</div>
                  <div className="text-xs text-slate-600">{car.location || "N/A"} | INR {car.pricePerDay}/day</div>
                </Link>
              ))}
              {alternatives.premiumOptions?.length === 0 && <div className="text-xs text-slate-500">No premium upgrades available in current top matches.</div>}
            </div>
          </div>
        </div>
      )}

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

              {car.scoreBreakdown && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-2">Why this score</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(car.scoreBreakdown)
                      .filter(([, value]) => Number(value) > 0)
                      .sort((a, b) => Number(b[1]) - Number(a[1]))
                      .slice(0, 3)
                      .map(([key, value]) => (
                        <span key={`${car._id}-${key}`} className="px-2 py-1 rounded-full text-[11px] font-medium bg-cyan-50 text-cyan-700 border border-cyan-100">
                          {key}: +{value}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleItemFeedback(car._id, "like")}
                  disabled={activeFeedbackId !== null}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 transition-colors ${car.feedbackState === "liked" ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"} disabled:opacity-60`}
                >
                  <ThumbsUp size={12} />
                  More like this
                </button>
                <button
                  type="button"
                  onClick={() => handleItemFeedback(car._id, "dislike")}
                  disabled={activeFeedbackId !== null}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 transition-colors ${car.feedbackState === "disliked" ? "bg-rose-600 text-white" : "bg-rose-100 text-rose-700 hover:bg-rose-200"} disabled:opacity-60`}
                >
                  <ThumbsDown size={12} />
                  Less like this
                </button>
              </div>

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