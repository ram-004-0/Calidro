import React, { useState } from "react";
import UserHeader from "../Components/UserHeader";
import StepByStep from "../Components/StepByStep";
import BookingPage from "./BookingPage";
import PaymentPage from "./PaymentPage";
import ReviewDetails from "./ReviewDetails";

const Booking = () => {
  const [step, setStep] = useState(1);
  // State to hold all the booking info for pricing and DB
  const [bookingData, setBookingData] = useState({});

  const handleNextStep = (data) => {
    setBookingData((prev) => ({ ...prev, ...data }));
    setStep(step + 1);
  };

  return (
    <div className="min-h-screen bg-[#433633] text-[#4a3733] flex flex-col">
      <UserHeader />
      <StepByStep currentStep={step} />

      <section className="w-full flex justify-center py-2 px-4">
        <div className="w-full max-w-8xl bg-[#f1f1f1] rounded-3xl shadow-xl p-10 transition-all duration-300 min-h-140">
          {step === 1 && <BookingPage onNext={handleNextStep} />}

          {step === 2 && (
            <PaymentPage
              bookingData={bookingData}
              onBack={() => setStep(1)}
              onNext={handleNextStep}
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default Booking;
