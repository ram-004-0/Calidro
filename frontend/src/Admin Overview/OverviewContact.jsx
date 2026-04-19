import React, { useState } from "react";
import { Phone, Mail, MapPin, Clock, Save, Info } from "lucide-react";

const OverviewContact = () => {
  const [contact, setContact] = useState({
    phone: "275003014",
    email: "calidroreservations@gmail.com",
    location: "375 F. Antonio St. Malinao, Pasig City",
    weekdayHours: "8:00am - 9:00pm",
    weekendHours: "8:00am - 11:00pm",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContact((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated Contact Info:", contact);
    // Add your axios/fetch call here
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-[#4a3733] mb-4 uppercase tracking-wider">
        Contact Information
      </h1>

      <div className="flex gap-6 items-start">
        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 w-105 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Phone Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Phone size={12} /> Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={contact.phone}
                onChange={handleChange}
                className="w-full bg-[#fcfaf9] border border-gray-100 rounded-xl p-3 text-sm text-[#4a3733] focus:outline-none focus:border-[#4a3733] transition-all"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Mail size={12} /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={contact.email}
                onChange={handleChange}
                className="w-full bg-[#fcfaf9] border border-gray-100 rounded-xl p-3 text-sm text-[#4a3733] focus:outline-none focus:border-[#4a3733] transition-all"
              />
            </div>

            {/* Location Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={12} /> Location
              </label>
              <input
                type="text"
                name="location"
                value={contact.location}
                onChange={handleChange}
                className="w-full bg-[#fcfaf9] border border-gray-100 rounded-xl p-3 text-sm text-[#4a3733] focus:outline-none focus:border-[#4a3733] transition-all"
              />
            </div>

            {/* Hours Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={12} /> Weekdays
                </label>
                <input
                  type="text"
                  name="weekdayHours"
                  value={contact.weekdayHours}
                  onChange={handleChange}
                  placeholder="8:00am-9:00pm"
                  className="w-full bg-[#fcfaf9] border border-gray-100 rounded-xl p-3 text-xs text-[#4a3733] focus:outline-none focus:border-[#4a3733]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={12} /> Weekends
                </label>
                <input
                  type="text"
                  name="weekendHours"
                  value={contact.weekendHours}
                  onChange={handleChange}
                  placeholder="8:00am-11:00pm"
                  className="w-full bg-[#fcfaf9] border border-gray-100 rounded-xl p-3 text-xs text-[#4a3733] focus:outline-none focus:border-[#4a3733]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 w-full bg-[#4a3733] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#3a2c28] transition-all shadow-sm active:scale-95"
            >
              <Save size={18} />
              Save Contact Info
            </button>
          </form>
        </div>

        {/* Live Preview / Sidebar */}
        <div className="w-80 space-y-4">
          <div className="bg-[#fdfcfb] p-6 rounded-2xl shadow-sm border border-dashed border-gray-300">
            <h2 className="text-sm font-bold mb-4 text-[#4a3733] uppercase flex items-center gap-2">
              <Info size={16} /> Live Preview
            </h2>
            <div className="space-y-4">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-50">
                <p className="text-[9px] text-gray-400 uppercase font-bold tracking-tighter">
                  Current Email
                </p>
                <p className="text-xs text-[#4a3733] truncate">
                  {contact.email}
                </p>
              </div>
              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-50">
                <p className="text-[9px] text-gray-400 uppercase font-bold tracking-tighter">
                  Office Hours
                </p>
                <p className="text-[11px] text-[#4a3733]">
                  Mon-Fri: {contact.weekdayHours}
                </p>
                <p className="text-[11px] text-[#4a3733]">
                  Sat-Sun: {contact.weekendHours}
                </p>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-gray-400 px-2 italic">
            * These details will appear in the footer and contact page of the
            main website.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OverviewContact;
