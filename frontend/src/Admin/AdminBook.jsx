import AdminHeader from "../Components/AdminHeader";

const AdminBook = () => {
  return (
    <div className="min-h-screen bg-[#433633] text-[#4a3733] flex flex-col h-full">
      <AdminHeader />
      <section className="relative w-full flex-1">
        {/* ================= Container ================= */}
        <div className="max-w-365 mx-auto bg-[#f1f1f1] rounded-3xl shadow-xl p-6 h-140 flex flex-col">
          <h1 className="text-2xl font-bold text-[#4a3733] mb-4 uppercase">
            Reservation Requests
          </h1>

          {/* ================= Search ================= */}
          <div className="grid grid-cols-3 gap-10 mb-4">
            <select className="bg-white border border-gray-300 rounded-full p-3">
              <option>Type of event</option>
              <option>Wedding</option>
              <option>Birthday</option>
              <option>Corporate</option>
            </select>
            <input
              className="bg-white border border-gray-300 rounded-full p-3"
              placeholder="Search"
            />
            <select className="bg-white border border-gray-300 rounded-full p-3">
              <option>Sort by</option>
              <option>Date</option>
              <option>Type</option>
            </select>
          </div>

          {/* ================= Book History ================= */}
          <div className="bg-white border border-white rounded-lg shadow-lg overflow-y-auto flex-1 text-[#4a3733] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
            <table className="table-fixed w-full text-left">
              <thead className="font-medium sticky top-0 bg-white z-10">
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-2">ID</th>
                  <th className="py-3 px-2">Name</th>
                  <th className="py-3 px-2">Event</th>
                  <th className="py-3 px-2">Date & Time</th>
                  <th className="py-3 px-2">Pax</th>
                  <th className="py-3 px-2">Event</th>
                  <th className="py-3 px-2">Payment Status</th>
                  <th className="py-3 px-2">Booking Status</th>
                </tr>
              </thead>
              <tbody>
                {/* Example rows */}
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-200">
                    <td className="py-8 px-2"></td>
                    <td className="py-8 px-2"></td>
                    <td className="py-8 px-2"></td>
                    <td className="py-8 px-2"></td>
                    <td className="py-8 px-2"></td>
                    <td className="py-8 px-2 flex flex-col items-start gap-2">
                      Wedding
                      <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-300">
                        ••• View Details
                      </button>
                    </td>
                    <td className="py-8 px-2">
                      <span className="bg-yellow-300 text-[#4a3733] px-3 py-1 rounded-full text-sm">
                        Partially Paid
                      </span>
                      <br />
                      <a
                        href="#"
                        className="text-blue-600 text-sm hover:underline"
                      >
                        Update Payment
                      </a>
                    </td>
                    <td className="py-8 px-2">
                      <span className="bg-yellow-300 text-[#4a3733] px-3 py-1 rounded-full text-sm">
                        Pending
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="w-full">
        <div className="flex justify-end text-[#4a3733] uppercase font-medium px-7 py-4">
          <button className="bg-[#f4dfba] hover:bg-white hover:text-[#4a3733] px-10 py-3 rounded-full text-sm font-bold uppercase">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminBook;
