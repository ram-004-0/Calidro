import { useState, useMemo, useEffect } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const PaymentPage = ({ onBack, bookingData: propBookingData }) => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 1. Initialize state with empty strings to avoid server/client mismatch
  const [phone, setPhone] = useState("");
  const [addr, setAddr] = useState("");
  const [amountInput, setAmountInput] = useState("5000");

  // 2. Single UseEffect for mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const bookingData = propBookingData || state?.bookingData || {};
  const isRestricted = state?.paymentTypeRestriction === "Full";
  const amountToPayFromState = state?.amountToPay;

  const [paymentType, setPaymentType] = useState(
    isRestricted ? "full" : "partial",
  );

  const handleBack = () => {
    navigate("/user-bookings"); // Replace with your actual route path
  };

  // 3. Hydration Guard for useMemo
  const totalAmount = useMemo(() => {
    if (!isMounted) return 0;

    if (isRestricted && amountToPayFromState !== undefined) {
      return parseFloat(amountToPayFromState);
    }

    const d = parseInt(
      bookingData?.duration || bookingData?.event_duration || 4,
    );
    const i = parseInt(bookingData?.ingress || bookingData?.ingress_time || 2);
    const e = parseInt(bookingData?.egress || bookingData?.egress_time || 1);

    const BASE_PRICE = 25000;
    return (
      BASE_PRICE +
      (d - 4) * 5000 +
      Math.max(0, i - 2) * 1000 +
      Math.max(0, e - 1) * 1000
    );
  }, [isMounted, bookingData, isRestricted, amountToPayFromState]);

  // 4. Fill form only AFTER mounting is confirmed
  useEffect(() => {
    if (isMounted && user) {
      setPhone(bookingData?.phone_number || user?.phone_number || "");
      setAddr(bookingData?.address || user?.address || "");
    }
  }, [isMounted, user, bookingData]);

  // 5. CRITICAL: The return guard
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-400 animate-pulse">
          Loading Payment Details...
        </div>
      </div>
    );
  }
  const formatNumber = (val) => Number(val).toLocaleString("en-PH");

  const handleUpdateBalance = async (methods) => {
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

  const handlePaymentMethodClick = async (methods) => {
    if (!user?.user_id) return alert("Please log in.");
    const numericAmount = parseFloat(amountInput) || 0;
    if (paymentType === "partial" && numericAmount < 5000) {
      return alert("Minimum downpayment is ₱5,000.");
    }
    setLoading(true);

    try {
      const payload = {
        userId: user.user_id,
        phone_number: phone,
        address: addr,
        eventName: bookingData?.eventName || "Untitled",
        eventType: bookingData?.eventType,
        eventDate: bookingData?.eventDate,
        time: bookingData?.time,
        duration: bookingData?.duration,
        ingress: bookingData?.ingress_time,
        egress: bookingData?.egress_time,
        guests: bookingData?.noOfGuests || bookingData?.guests || 0,
        totalAmount: totalAmount,
        amount_paid: paymentType === "full" ? totalAmount : numericAmount,
        paymentType: paymentType,
        payment_methods: methods,
      };

      const response = await API.post(
        "/bookings/create-booking-and-checkout",
        payload,
      );
      if (response.data?.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (err) {
      alert("Error: " + (err.response?.data?.details || err.message));
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
          onClick={handleBack}
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
