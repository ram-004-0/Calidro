import { useState, useMemo } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLocation, useSearchParams } from "react-router-dom"; // Updated imports
import axios from "axios";

const PaymentPage = ({ onBack, bookingData: propBookingData }) => {
  const { state } = useLocation();
  const [searchParams] = useSearchParams();

  const bookingData = propBookingData || state?.bookingData || {};
  const isRestricted = state?.paymentTypeRestriction === "Full";
  const amountToPayFromState = state?.amountToPay;
  const { user } = useAuth();

  const [phone, setPhone] = useState(
    bookingData?.phone_number || user?.phone_number || "",
  );
  const [addr, setAddr] = useState(bookingData?.address || user?.address || "");
  const [loading, setLoading] = useState(false);

  const totalAmount = useMemo(() => {
    if (isRestricted && amountToPayFromState) return amountToPayFromState;
    const {
      duration = 4,
      ingress_time = 2,
      egress_time = 1,
    } = bookingData || {};
    const BASE_PRICE = 25000;
    return (
      BASE_PRICE +
      (duration - 4) * 5000 +
      Math.max(0, ingress_time - 2) * 1000 +
      Math.max(0, egress_time - 1) * 1000
    );
  }, [bookingData, isRestricted, amountToPayFromState]);

  const [paymentType, setPaymentType] = useState(
    isRestricted ? "full" : "partial",
  );
  const [amountInput, setAmountInput] = useState("5000");

  const formatNumber = (val) => Number(val).toLocaleString("en-PH");

  const handleUpdateBalance = async (methods) => {
    // 1. Robust ID extraction: Ensure we get the actual value, not a string "undefined"
    const urlId = searchParams.get("bookingId");
    const stateId =
      state?.bookingData?.booking_id || state?.bookingId || state?.id;
    const bId = urlId || stateId;

    console.log("DEBUG: Final Payload sent to Server:", {
      bookingId: bId,
      payment_methods: methods,
    });

    if (!bId || bId === "undefined") {
      alert(
        "CRITICAL ERROR: No valid Booking ID found. Please refresh the page.",
      );
      return;
    }

    setLoading(true);

    try {
      const url =
        "https://calidro-production.up.railway.app/api/bookings/checkout-balance";
      const payload = {
        bookingId: bId,
        payment_methods: methods,
      };

      const response = await axios.post(url, payload);

      if (response.data.checkout_url) {
        // Redirect to PayMongo
        window.location.href = response.data.checkout_url;
      }
    } catch (err) {
      const serverMessage =
        err.response?.data?.details || err.response?.data?.error || err.message;
      console.error("❌ Payment Initiation Error:", serverMessage);
      alert("Payment initiation failed: " + serverMessage);
    } finally {
      setLoading(false);
    }
  };

  // Ensure this function exists in your component to handle partial payments
  const handlePaymentMethodClick = async (methods) => {
    if (!user?.user_id) return alert("Please log in.");
    const numericAmount = parseFloat(amountInput) || 0;
    setLoading(true);

    try {
      let response;

      if (isRestricted) {
        // SCENARIO A: Updating balance for an EXISTING booking
        const payload = {
          bookingId: state.bookingId,
          amount_paid: numericAmount,
          payment_methods: methods,
          isBalanceUpdate: true,
        };

        response = await API.post("/bookings/checkout-balance", payload);
      } else {
        // SCENARIO B: Creating a BRAND NEW booking
        const payload = {
          bookingId: bookingData?.booking_id,
          userId: user.user_id,
          username: user.username || "Guest",
          email: user.email || "",
          phone_number: phone,
          address: addr,
          eventName: bookingData?.eventName || "Untitled",
          eventType: bookingData?.eventType,
          eventDate: bookingData?.date,
          time: bookingData?.time,
          duration: bookingData?.duration,
          ingress: bookingData?.ingress || 2,
          egress: bookingData?.egress || 1,
          guests: bookingData?.guests,
          totalAmount: totalAmount,
          amount_paid: numericAmount,
          paymentType: paymentType,
          payment_methods: methods,
        };

        // We use the 'response' variable defined at the top of the try block
        response = await API.post(
          "/bookings/create-booking-and-checkout",
          payload,
        );
        console.log("Backend Response:", response.data);
      }

      // Handle redirection for either scenario
      if (response.data && response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      } else {
        throw new Error("Checkout URL missing in server response.");
      }
    } catch (err) {
      console.error("PAYMENT ERROR:", err);
      alert("Payment failed: " + (err.response?.data?.details || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 p-8">
      {/* --- Left Side: Payment Details --- */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#4a3733] uppercase">
          {isRestricted ? "Settling Balance" : "Payment Details"}
        </h2>

        <Row label={isRestricted ? "REMAINING BALANCE" : "TOTAL AMOUNT"}>
          <div className="font-bold text-red-600">
            ₱{formatNumber(totalAmount)}
          </div>
        </Row>

        <Row label="TYPE OF PAYMENT">
          <div className="flex gap-4">
            {!isRestricted && (
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentType"
                  checked={paymentType === "partial"}
                  onChange={() => setPaymentType("partial")}
                />
                Partial
              </label>
            )}
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="paymentType"
                checked={paymentType === "full"}
                onChange={() => setPaymentType("full")}
                disabled={isRestricted}
              />
              Full
            </label>
          </div>
        </Row>

        <Row label="AMOUNT TO BE PAID">
          <input
            className="w-full bg-transparent outline-none font-semibold text-emerald-600"
            type="text"
            disabled={paymentType === "full" || isRestricted}
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
          className="hidden md:block bg-gray-300 px-8 py-2 rounded-full uppercase text-sm font-bold"
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
            onClick={() =>
              isRestricted
                ? handleUpdateBalance(["card"])
                : handlePaymentMethodClick(["card"])
            }
          />
          <PaymentOption
            title="E-Wallets"
            subtitle="GCash, Maya"
            onClick={() =>
              isRestricted
                ? handleUpdateBalance(["gcash", "paymaya"])
                : handlePaymentMethodClick(["gcash", "paymaya"])
            }
          />
          <PaymentOption
            title="Online Banking"
            subtitle="Landbank, Metrobank"
            onClick={() =>
              isRestricted
                ? handleUpdateBalance(["brankas_landbank", "brankas_metrobank"])
                : handlePaymentMethodClick([
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
