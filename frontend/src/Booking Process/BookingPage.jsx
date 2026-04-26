import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  getDay,
  isBefore,
  startOfToday,
  parseISO,
} from "date-fns";

import { useAuth } from "../context/AuthContext";
const API_URL =
  "https://calidro-production.up.railway.app" || "http://localhost:5000";
export default function BookingPage({ onNext }) {
  const { user } = useAuth();
  const location = useLocation();
  const rescheduleData = location.state?.rescheduleData;
  const isRescheduling = !!rescheduleData;

  // 1. Unified State Declarations
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    isRescheduling ? parseISO(rescheduleData.date) : null,
  );
  const [selectedTime, setSelectedTime] = useState(
    isRescheduling ? rescheduleData.time : "",
  );
  // Ensure these keys match your database return object
  const [duration, setDuration] = useState(
    isRescheduling ? parseInt(rescheduleData.event_duration) : 4,
  );
  const [ingress, setIngress] = useState(
    isRescheduling ? parseInt(rescheduleData.ingress_time) : 2,
  );
  const [egress, setEgress] = useState(
    isRescheduling ? parseInt(rescheduleData.egress_time) : 1,
  );

  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];
    const slots = [];
    const isSunday = getDay(selectedDate) === 0;
    const startHour = isSunday ? 15 : 8;
    const endHour = 20;

    for (let i = startHour; i <= endHour; i++) {
      let label = i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i - 12} PM`;
      slots.push({ label: label, hour24: i });
    }

    return slots;
  }, [selectedDate]);

  const durationOptions = useMemo(() => {
    const baseOptions = [4, 5, 6, 7, 8, 9, 10];

    if (isRescheduling && rescheduleData?.event_duration) {
      // Ensure we treat the existing duration as the floor
      const minDuration = parseInt(rescheduleData.event_duration) || 4;
      return baseOptions.filter((h) => h >= minDuration);
    }

    if (!selectedTime) return baseOptions;
    const selectedSlot = timeSlots.find((s) => s.label === selectedTime);
    if (!selectedSlot) return baseOptions;

    const hoursRemaining = 24 - selectedSlot.hour24;
    return baseOptions.filter((h) => h <= hoursRemaining);
  }, [isRescheduling, rescheduleData, selectedTime, timeSlots]);

  const ingressOptions = useMemo(() => {
    const baseOptions = [1, 2, 3, 4];
    if (isRescheduling && rescheduleData?.ingress_time) {
      const minIngress = parseInt(rescheduleData.ingress_time);
      return baseOptions.filter((h) => h >= minIngress);
    }
    return baseOptions;
  }, [isRescheduling, rescheduleData]);

  const egressOptions = useMemo(() => {
    const baseOptions = [1, 2, 3, 4];
    if (isRescheduling && rescheduleData?.egress_time) {
      const minEgress = parseInt(rescheduleData.egress_time);
      return baseOptions.filter((h) => h >= minEgress);
    }
    return baseOptions;
  }, [isRescheduling, rescheduleData]);

  const updateBookingOnly = async (payload) => {
    try {
      // Log the full URL to your console to verify it's correct
      const url = `${API_URL}/reschedule/${rescheduleData.id}`;
      console.log("Sending PUT to:", url);

      const response = await axios.put(url, payload);
      alert("Booking updated successfully!");
    } catch (err) {
      // If this is still 404, the URL string above is wrong for your backend setup
      console.error("Update failed:", err.response?.data || err.message);
      alert(
        "Failed to update booking. Server responded with 404: Check if the route exists.",
      );
    }
  };

  const [eventType, setEventType] = useState("");
  const [eventName, setEventName] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const today = startOfToday();
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || "");
  const [address, setAddress] = useState(user?.address || "");
  const [bookedDates, setBookedDates] = useState([]);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  useEffect(() => {
    //view from mobile
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);

    const fetchBookings = async () => {
      try {
        console.log("Fetching from:", `${API_URL}/api/bookings/all`); // Debug check
        const response = await axios.get(`${API_URL}/api/bookings/all`);

        console.log("API Response:", response.data); // Debug check

        const formattedDates = response.data.map((b) =>
          format(new Date(b.event_date), "yyyy-MM-dd"),
        );
        setBookedDates(formattedDates);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      }
    };

    fetchBookings();

    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty dependency array ensures this runs once on mount

  const unavailableDates = [...bookedDates];
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({
    start: calendarStart,

    end: calendarEnd,
  });

  const isUnavailable = (date) => {
    return unavailableDates.includes(format(date, "yyyy-MM-dd"));
  };

  const getDayStyle = (date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const isPastDate = isBefore(date, startOfToday());
    const isBooked = bookedDates.includes(dateStr);
    const isUnavailableDate = isUnavailable(date);

    if (!isSameMonth(date, monthStart)) return "text-gray-300";
    if (isUnavailableDate || isBooked) {
      return "bg-red-300 cursor-not-allowed";
    }
    if (isPastDate) {
      return "bg-gray-100 text-gray-300 cursor-not-allowed";
    }
    if (selectedDate && isSameDay(date, selectedDate)) return "bg-yellow-300";
    return "bg-green-200 hover:bg-green-300 cursor-pointer";
  };

  const handleGuestChange = (e) => {
    const value = e.target.value;
    if (value === "" || (parseInt(value) <= 200 && parseInt(value) >= 0)) {
      setGuestCount(value);
    }
  };

  const allowedIngressDurations = useMemo(() => {
    const defaultOptions = [1, 2, 3, 4];
    if (!selectedTime || !selectedDate) return defaultOptions;
    const isSunday = getDay(selectedDate) === 0;
    if (!isSunday) return defaultOptions;
    const selectedSlot = timeSlots.find((s) => s.label === selectedTime);
    if (!selectedSlot) return defaultOptions;
    const maxAllowedDuration = selectedSlot.hour24 - 13;
    return defaultOptions.filter((d) => d <= maxAllowedDuration && d > 0);
  }, [selectedTime, selectedDate, timeSlots]);

  const handleNextClick = () => {
    const convertTo24Hour = (timeStr) => {
      if (!timeStr) return "00:00:00";
      const [time, modifier] = timeStr.split(" ");
      let [hours, minutes] = time.split(":");
      if (!minutes) minutes = "00";
      let hoursNum = parseInt(hours, 10);
      if (modifier === "PM" && hoursNum < 12) hoursNum += 12;
      if (modifier === "AM" && hoursNum === 12) hoursNum = 0;
      return `${hoursNum.toString().padStart(2, "0")}:${minutes}:00`;
    };

    const isUpgraded =
      isRescheduling &&
      (parseInt(duration) > parseInt(rescheduleData.duration) ||
        parseInt(ingress) > parseInt(rescheduleData.ingress_time) ||
        parseInt(egress) > parseInt(rescheduleData.egress_time));

    const bookingPayload = {
      username,
      email,
      address,
      phone_number: phoneNumber,
      eventName,
      eventType,
      date: format(selectedDate, "yyyy-MM-dd"),
      time: convertTo24Hour(selectedTime), // Use this unified time format
      duration: parseInt(duration),
      ingress_time: parseInt(ingress),
      egress_time: parseInt(egress),
      guests: guestCount,
      isReschedule: isRescheduling,
      isUpgrade: isUpgraded,
      originalBookingId: isRescheduling ? rescheduleData.id : null,
    };

    // LOGIC FIX:
    // If we are just updating a date (no upgrade), call the API directly.
    // Otherwise, pass everything to onNext to handle the payment flow.
    if (isRescheduling && !isUpgraded) {
      updateBookingOnly(bookingPayload);
    } else {
      onNext(bookingPayload);
    }
  };

  return (
    <div className="bg-[#f1f1f1] w-full max-w-7xl rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-2">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-[#4a3733] mb-4 uppercase">
          {isRescheduling ? "Reschedule Booking" : "Booking Details"}
        </h1>

        <FormRow label="TYPE OF EVENT">
          <select
            disabled={isRescheduling}
            className={`input-style flex-1 ${isRescheduling ? "opacity-50 cursor-not-allowed" : ""}`}
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
          >
            <option value="" disabled>
              Select an event type
            </option>

            <optgroup label="Social Events">
              <option value="Birthday Party">Birthday Party</option>

              <option value="Debut">Debut (18th Birthday)</option>

              <option value="Wedding Ceremony">Wedding Ceremony</option>

              <option value="Wedding Reception">Wedding Reception</option>

              <option value="Anniversary">Anniversary Celebration</option>
            </optgroup>

            <optgroup label="Family Milestones">
              <option value="Baby Shower">Baby Shower</option>

              <option value="Gender Reveal">Gender Reveal</option>

              <option value="Baptism">Baptism / Christening</option>

              <option value="Graduation Party">Graduation Party</option>
            </optgroup>

            <optgroup label="Corporate Events">
              <option value="Corporate Meeting">Corporate Meeting</option>

              <option value="Seminar">Seminar / Workshop</option>

              <option value="Conference">Conference</option>

              <option value="Team Building">Team Building Event</option>

              <option value="Company Party">Company Party</option>
            </optgroup>

            <optgroup label="Creative / Others">
              <option value="Exhibit">Exhibit / Art Showcase</option>

              <option value="Pop-up Market">Pop-up Market / Bazaar</option>

              <option value="Photoshoot">Photoshoot / Studio Rental</option>

              <option value="Other">Other</option>
            </optgroup>
          </select>
        </FormRow>

        <FormRow label="NAME OF EVENT:">
          <input
            type="text"
            disabled={isRescheduling}
            className={`input-style flex-1 ${isRescheduling ? "opacity-50 cursor-not-allowed" : ""}`}
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
        </FormRow>

        <FormRow label="DATE">
          <input
            type="text"
            value={selectedDate ? format(selectedDate, "MM/dd/yyyy") : ""}
            readOnly
            placeholder="Select from calendar"
            className="input-style flex-1"
          />
        </FormRow>

        <div
          className={`grid ${isMobileView ? "grid-cols-1" : "grid-cols-2"} gap-2`} //adjusting the four formrows in mobile view
        >
          <FormRow label="TIME">
            <select
              className="input-style w-full cursor-pointer"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            >
              <option value="">
                {selectedDate ? "Select Time" : "Pick a date first"}
              </option>

              {timeSlots.map((slot) => (
                <option key={slot.hour24} value={slot.label}>
                  {slot.label}
                </option>
              ))}
            </select>
          </FormRow>

          <FormRow label="DURATION">
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="input-style w-full"
            >
              {durationOptions.map((h) => (
                <option key={h} value={h}>
                  {h} Hours
                </option>
              ))}
            </select>
          </FormRow>
        </div>

        <div
          className={`grid ${isMobileView ? "grid-cols-1" : "grid-cols-2"} gap-2`} //adjusting the four formrows in mobile view
        >
          <FormRow label="INGRESS">
            <select
              value={ingress}
              onChange={(e) => setIngress(e.target.value)}
              className="input-style w-full"
            >
              {ingressOptions.map((h) => (
                <option key={h} value={h}>
                  {h} Hour{h > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </FormRow>
          <FormRow label="EGRESS">
            <select
              value={egress}
              onChange={(e) => setEgress(e.target.value)}
              className="input-style w-full"
            >
              {egressOptions.map((h) => (
                <option key={h} value={h}>
                  {h} Hour{h > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </FormRow>
        </div>

        <FormRow label="NO. OF GUESTS">
          <div className="flex-1 flex flex-col">
            <input
              type="number"
              value={guestCount}
              onChange={handleGuestChange}
              disabled={isRescheduling} // <--- ADD THIS
              max="200"
              placeholder="Max 200 pax"
              className={`input-style w-full ${
                parseInt(guestCount) === 200 ? "border-orange-400" : ""
              } ${isRescheduling ? "opacity-50 cursor-not-allowed" : ""}`} // <--- ADD THIS VISUAL CUE
            />

            <span className="text-[10px] text-[#4a3733] mt-1 ml-2">
              Maximum capacity: 200 persons
            </span>
          </div>
        </FormRow>

        <div className="pt-2 hidden md:block">
          <button
            onClick={handleNextClick}
            className="bg-[#f4dfba] hover:bg-white transition px-10 py-3 rounded-full font-bold uppercase text-sm shadow-md"
          >
            {isRescheduling ? "Confirm Reschedule >" : "Next >"} &gt;
          </button>
        </div>
      </div>

      {/* RIGHT PANEL - CALENDAR */}
      <div className="bg-white rounded-2xl shadow-inner p-4 flex flex-col justify-start h-auto shadow-md ml-0 md:ml-10">
        <div>
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1 hover:bg-gray-100 rounded-full transition"
            >
              &lt;
            </button>

            <h3 className="font-bold text-sm">
              {format(currentMonth, "MMMM yyyy")}
            </h3>

            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1 hover:bg-gray-100 rounded-full transition"
            >
              &gt;
            </button>
          </div>

          <div className="grid grid-cols-7 text-center font-bold text-[10px] text-gray-400 mb-2 uppercase tracking-widest">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Reduced gap and py-3 to py-2 to shrink height */}

          <div className="grid grid-cols-7 gap-1 text-center">
            {days.map((day) => {
              const isPast = isBefore(day, startOfToday());

              const isBooked = bookedDates.includes(format(day, "yyyy-MM-dd"));

              const isUnavailableDate = isUnavailable(day);

              const isDisabled = isPast || isBooked || isUnavailableDate;

              return (
                <div
                  key={day.toString()}
                  onClick={() => {
                    if (!isDisabled) {
                      setSelectedDate(day);

                      setSelectedTime("");
                    }
                  }}
                  className={`py-3 rounded-xl text-sm font-semibold transition ${getDayStyle(day)} ${
                    isDisabled ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {format(day, "d")}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-gray-100 text-[10px] font-medium">
          <Legend color="bg-green-300" label="Available" />

          <Legend color="bg-red-300" label="Unavailable" />

          <Legend color="bg-yellow-300" label="Selected" />
        </div>
      </div>
      {isMobileView && (
        <div className="mt-6">
          <button
            onClick={handleNextClick}
            className="bg-[#f4dfba] hover:bg-white transition w-full py-4 rounded-full font-bold uppercase text-sm shadow-md"
          >
            Next &gt;
          </button>
        </div>
      )}
    </div>
  );
}

function FormRow({ label, children }) {
  return (
    <div className="flex items-center gap-3">
      <label className="w-32 bg-white rounded-full px-4 py-2 text-[10px] font-bold text-[#4a3733] uppercase tracking-tighter shrink-0 shadow-sm border border-gray-100">
        {label}
      </label>

      {children}
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-3 h-3 rounded-full ${color}`} />

      <span className="text-gray-500">{label}</span>
    </div>
  );
}
