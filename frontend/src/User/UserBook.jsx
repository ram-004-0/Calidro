import React, { useState } from "react";
import UserHeader from "../Components/UserHeader";
import UserBookingCard from "../Props/UserBookingCard";
import { Link } from "react-router-dom";

const UserBook = () => {
  const [bookings, setBookings] = useState([
    {
      id: 1,
      eventName: "Wedding Celebration",
      date: "1/25/2026",
      time: "5:00PM",
      typeOfEvent: "Wedding",
      duration: "8 Hours",
      noOfGuests: 150,
      total: 45000,
      paid: 45000,
      balance: 0,
      bookingStatus: "Completed",
      serName: "Maria Clara delos Santos",
      email: "maria.clara@email.com",
      contactNo: "0917-123-4567",
      address: "123 Balagtas St., Binondo, Manila",
    },
    {
      id: 2,
      eventName: "Birhtday Party",
      date: "4/27/2026",
      time: "8:00PM",
      typeOfEvent: "Birthday",
      duration: "5 Hours",
      noOfGuests: 60,
      total: 30000,
      paid: 5000,
      balance: 25000,
      bookingStatus: "Confirmed",
      userName: "Maria Clara delos Santos",
      email: "maria.clara@email.com",
      contactNo: "0917-123-4567",
      address: "123 Balagtas St., Binondo, Manila",
    },
    {
      id: 3,
      eventName: "Reunion",
      date: "5/15/2026",
      time: "8:00PM",
      typeOfEvent: "Etc.",
      duration: "4",
      noOfGuests: 50,
      total: 25000,
      paid: 5000,
      balance: 20000,
      bookingStatus: "Pending",
      serName: "Maria Clara delos Santos",
      email: "maria.clara@email.com",
      contactNo: "0917-123-4567",
      address: "123 Balagtas St., Binondo, Manila",
    },
  ]);

  const sortedBookings = [...bookings].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  return (
    <div className="min-h-screen bg-[#433633] text-[#4a3733] flex flex-col h-screen overflow-hidden">
      <UserHeader />

      <section className="relative pb-2 w-full flex-1 flex flex-col items-center">
        <div className="max-w-365 w-full mx-auto bg-[#f1f1f1] rounded-3xl shadow-xl p-6 h-140 flex flex-col">
          <h1 className="text-2xl font-bold text-[#4a3733] mb-4 uppercase shrink-0">
            Bookings
          </h1>

          <div className=" flex flex-col gap-4 overflow-y-auto pr-2 flex-1 min-h-0">
            {sortedBookings.length > 0 ? (
              sortedBookings.map((booking) => (
                <div key={booking.id} className="w-full shrink-0">
                  <UserBookingCard booking={booking} />
                </div>
              ))
            ) : (
              <div className="bg-white p-10 rounded-lg text-center border border-dashed border-gray-300 shrink-0">
                <p className="text-gray-500">No reservations found.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer area with button */}
      <div className="w-full shrink-0">
        <div className="flex justify-end text-[#4a3733] uppercase font-medium px-7 py-3">
          <Link
            to="/booking"
            className="bg-[#f4dfba] hover:bg-white hover:text-[#4a3733] px-10 py-3 rounded-full text-sm font-bold uppercase transition-colors shadow-md"
          >
            Create new booking
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserBook;
