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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    isRescheduling ? parseISO(rescheduleData.date) : null,
  );
  const [selectedTime, setSelectedTime] = useState(
    isRescheduling ? rescheduleData.time : "",
  );
  const [duration, setDuration] = useState(
    isRescheduling ? parseInt(rescheduleData.event_duration) : 4,
  );
  const [ingress, setIngress] = useState(
    isRescheduling ? parseInt(rescheduleData.ingress_time) : 2,
  );
  const [egress, setEgress] = useState(
    isRescheduling ? parseInt(rescheduleData.egress_time) : 1,
  );
  const [isFullPayment, setIsFullPayment] = useState(false);

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
    const baseOptions = [2, 3, 4];
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

  const totalAmount = useMemo(() => {
    const BASE_PRICE = 25000;
    const d = parseInt(duration) || 4;
    const i = parseInt(ingress) || 2;
    const e = parseInt(egress) || 1;

    return (
      BASE_PRICE +
      (d - 4) * 5000 +
      Math.max(0, i - 2) * 1000 +
      Math.max(0, e - 1) * 1000
    );
  }, [duration, ingress, egress]);

  const updateBookingOnly = async (payload) => {
    try {
      const bId =
        rescheduleData?.booking_id || rescheduleData?.id || payload.booking_id;

      if (!bId) {
        console.error("No booking ID found:", rescheduleData);
        alert("Error: Could not identify the booking to update.");
        return;
      }

      // MAP FRONTEND NAMES TO BACKEND NAMES
      const sanitizedPayload = {
        userId: localStorage.getItem("userId"),
        event_date: payload.eventDate, // from handleNextClick's eventDate
        event_time: convertTo24Hour(payload.time), // ensuring 24h format
        event_duration: Number(payload.duration) || 0, // mapping 'duration' to 'event_duration'
        ingress_time: Number(payload.ingress) || 0, // mapping 'ingress' to 'ingress_time'
        egress_time: Number(payload.egress) || 0, // mapping 'egress' to 'egress_time'
        total_amount: Number(payload.totalAmount) || 0, // mapping 'totalAmount' to 'total_amount'
      };

      console.log("📤 FRONTEND SENDING TO BACKEND:", sanitizedPayload);

      const url = `${API_URL}/api/bookings/reschedule/${bId}`;

      await axios.put(url, sanitizedPayload);

      alert("Booking updated successfully!");
      // Optional: Refresh data or redirect
      window.location.reload();
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || err.response?.data?.message || err.message;

      console.error("Update failed:", err.response?.data);
      alert(`Failed to update booking: ${errorMsg}`);
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
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);

    const fetchBookings = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/bookings/all`);

        const formattedDates = response.data
          .map((b) => {
            if (!b.event_date) return null;
            return b.event_date.substring(0, 10);
          })
          .filter(Boolean);

        setBookedDates([...formattedDates]);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
        setBookedDates([format(new Date(), "yyyy-MM-dd")]);
      }
    };

    fetchBookings();

    if (isRescheduling && rescheduleData) {
      const origDuration = parseInt(rescheduleData.event_duration);
      const origIngress = parseInt(rescheduleData.ingress_time);
      const origEgress = parseInt(rescheduleData.egress_time);

      // If current state is lower than original, force it up to original
      if (duration < origDuration) setDuration(origDuration);
      if (ingress < origIngress) setIngress(origIngress);
      if (egress < origEgress) setEgress(origEgress);
    }

    return () => window.removeEventListener("resize", handleResize);
    // Added duration, ingress, egress to deps so it checks whenever they change
    // but only logic-gates them if isRescheduling is true.
  }, [isRescheduling, rescheduleData, duration, ingress, egress]);

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
    const isPastDate =
      isBefore(date, startOfToday()) || isSameDay(date, startOfToday());
    const isBooked = bookedDates.includes(dateStr);

    if (!isSameMonth(date, monthStart)) return "text-gray-300";

    if (isBooked) {
      return "bg-red-300 cursor-not-allowed text-white";
    }

    if (isPastDate) {
      return "bg-gray-100 text-gray-300 cursor-not-allowed";
    }

    if (selectedDate && isSameDay(date, selectedDate)) {
      return "bg-yellow-300 font-bold";
    }

    return "bg-green-200 hover:bg-green-300 cursor-pointer";
  };

  const handleGuestChange = (e) => {
    const value = e.target.value;
    if (value === "" || (parseInt(value) <= 200 && parseInt(value) >= 0)) {
      setGuestCount(value);
    }
  };

  const allowedIngressDurations = useMemo(() => {
    const defaultOptions = [2, 3, 4];

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

    if (!selectedDate || !selectedTime) {
      alert("Please select a Date and Time.");
      return;
    }

    if (!isRescheduling && !eventType) {
      alert("Please select an Event Type.");
      return;
    }
    const isUpgraded =
      isRescheduling &&
      (parseInt(duration) > parseInt(rescheduleData.event_duration) ||
        parseInt(ingress) > parseInt(rescheduleData.ingress_time) ||
        parseInt(egress) > parseInt(rescheduleData.egress_time));

    const bookingPayload = {
      userId:
        user?.user_id || user?.id || parseInt(localStorage.getItem("userId")),
      eventName: isRescheduling ? null : eventName,
      eventType: isRescheduling ? null : eventType,
      eventDate: format(selectedDate, "yyyy-MM-dd"),
      time: selectedTime,
      duration: parseInt(duration) || 0,
      ingress: parseInt(ingress) || 0,
      egress: parseInt(egress) || 0,
      guests: isRescheduling ? null : guestCount,
      totalAmount: totalAmount,
      isReschedule: isRescheduling,
      isUpgrade: isUpgraded,
      booking_id: isRescheduling
        ? rescheduleData.booking_id || rescheduleData.id
        : null,
    };

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
          className={`grid ${isMobileView ? "grid-cols-1" : "grid-cols-2"} gap-2`}
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
          className={`grid ${isMobileView ? "grid-cols-1" : "grid-cols-2"} gap-2`}
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
              } ${isRescheduling ? "opacity-50 cursor-not-allowed" : ""}`}
            />

            <span className="text-[10px] text-[#4a3733] mt-1 ml-2">
              Maximum capacity: 200 persons
            </span>
          </div>
        </FormRow>
        <br />

        <div className="pt-2 hidden md:block">
          <button
            onClick={handleNextClick}
            className="bg-[#f4dfba] hover:bg-white transition px-10 py-3 rounded-full font-bold uppercase text-sm shadow-md"
          >
            {isRescheduling ? "Confirm Reschedule >" : "Next"} &gt;
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

          <div className="grid grid-cols-7 gap-1 text-center">
            {days.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const isPast =
                isBefore(day, startOfToday()) || isSameDay(day, startOfToday());
              const isBooked = bookedDates.includes(dateStr);

              const isDisabled = isPast || isBooked;

              return (
                <div
                  key={day.toString()}
                  onClick={() => {
                    if (!isDisabled) {
                      setSelectedDate(day);
                      setSelectedTime("");
                    }
                  }}
                  className={`py-3 rounded-xl text-sm font-semibold transition ${getDayStyle(day)}`}
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
