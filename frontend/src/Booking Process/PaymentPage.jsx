import { useState, useMemo } from "react";
import API from "../services/api"; // Make sure this path is correct
import { useAuth } from "../context/AuthContext";

const PaymentPage = ({ onBack, bookingData }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const totalAmount = useMemo(() => {
    const { duration = 4, ingress = 2, egress = 1 } = bookingData || {};
    const BASE_PRICE = 25000;
    return (
      BASE_PRICE +
      (duration - 4) * 5000 +
      (ingress - 2) * 1000 +
      (egress - 1) * 1000
    );
  }, [bookingData]);

  const [paymentType, setPaymentType] = useState("partial");
  const [amountInput, setAmountInput] = useState("5000");

  const formatNumber = (val) => Number(val).toLocaleString("en-PH");
  const numericAmount =
    paymentType === "full"
      ? totalAmount
      : Number(amountInput.replace(/,/g, ""));

  const handlePaymentMethodClick = async (methods) => {
    if (!user?.id) return alert("Please log in.");

    setLoading(true);
    console.log("Starting payment flow for:", methods);

    try {
      // 1. Save Booking (Single, clean call)
      console.log("Sending booking data to /api/bookings/create");

      const payload = {
        userId: user.id,
        username: user.username || bookingData.username,
        email: user.email || bookingData.email,
        phone_number: user.phone_number || bookingData.phone,
        address: user.address || bookingData.address,
        eventName: bookingData?.eventName || "Untitled",
        eventType: bookingData?.eventType,
        eventDate: bookingData?.date,
        eventTime: bookingData?.time,
        duration: bookingData?.duration,
        guests: bookingData?.guests,
        totalAmount: totalAmount,
        amount_paid: numericAmount,
        paymentType: paymentType,
        ...bookingData,
      };

      console.log("FINAL PAYLOAD BEING SENT:", payload);

      const bookingResponse = await API.post("/api/bookings/create", payload);

      // Check if we got a valid response
      const bookingId = bookingResponse.data?.bookingId;
      if (!bookingId) {
        throw new Error("No Booking ID received from server.");
      }

      console.log("Booking created successfully. ID:", bookingId);

      // 2. Create PayMongo Checkout
      console.log("Requesting PayMongo Checkout for booking:", bookingId);
      const paymentResponse = await API.post("/api/payment/create-checkout", {
        amount: Math.round(numericAmount * 100), // Ensure it's an integer
        bookingId: bookingId,
        description: `Calidro: ${bookingData?.eventName || "Booking"}`,
        customerEmail: user.email,
        payment_methods: methods,
      });

      if (paymentResponse.data?.checkout_url) {
        window.location.href = paymentResponse.data.checkout_url;
      } else {
        throw new Error("No URL returned from server.");
      }
    } catch (err) {
      console.error("PAYMENT ERROR:", err.response?.data || err.message);
      alert("Payment failed: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 p-8">
      {/* --- Left Side: Payment Details --- */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#4a3733] uppercase">
          Payment Details
        </h2>
        <Row label="TOTAL AMOUNT">
          <div className="font-bold">₱{formatNumber(totalAmount)}</div>
        </Row>
        <Row label="TYPE OF PAYMENT">
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={paymentType === "partial"}
                onChange={() => setPaymentType("partial")}
              />{" "}
              Partial
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={paymentType === "full"}
                onChange={() => setPaymentType("full")}
              />{" "}
              Full
            </label>
          </div>
        </Row>
        <Row label="AMOUNT TO BE PAID">
          <input
            className="w-full bg-transparent outline-none"
            type="text"
            disabled={paymentType === "full"}
            value={
              paymentType === "full" ? formatNumber(totalAmount) : amountInput
            }
            onChange={(e) =>
              setAmountInput(e.target.value.replace(/[^\d]/g, ""))
            }
          />
        </Row>
        <button
          onClick={onBack}
          className="bg-gray-300 px-8 py-2 rounded-full uppercase text-sm font-bold"
        >
          Back
        </button>
      </div>

      {/* --- Right Side: Payment Methods --- */}
      <div className="bg-white rounded-2xl shadow p-6 border border-gray-100 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-20 rounded-2xl">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4a3733] mb-3"></div>
            <p className="font-bold text-[#4a3733]">Connecting to Gateway...</p>
          </div>
        )}
        <h3 className="text-center text-gray-500 uppercase tracking-widest text-sm mb-6">
          Select Payment Method
        </h3>
        <div className="space-y-4">
          <PaymentOption
            title="Credit / Debit Card"
            onClick={() => handlePaymentMethodClick(["card"])}
          />
          <PaymentOption
            title="E-Wallets"
            subtitle="GCash, Maya"
            onClick={() => handlePaymentMethodClick(["gcash", "paymaya"])}
          />
          <PaymentOption
            title="Online Banking"
            subtitle="Landbank, Metrobank"
            onClick={() =>
              handlePaymentMethodClick([
                "brankas_landbank",
                "brankas_metrobank",
              ])
            }
          />
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, children }) => (
  <div className="flex flex-col gap-2">
    <span className="text-xs font-bold text-gray-400 uppercase">{label}</span>
    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
      {children}
    </div>
  </div>
);
const PaymentOption = ({ title, subtitle, onClick }) => (
  <div
    onClick={onClick}
    className="p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-orange-50 transition"
  >
    <p className="font-bold">{title}</p>
    {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
  </div>
);

export default PaymentPage;
