import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const StepByStep = ({ currentStep = 1 }) => {
  const stepStyle =
    "px-5 py-2 rounded-full text-center transition-all duration-200";

  const getStepStyle = (stepNumber) =>
    currentStep === stepNumber
      ? "bg-[#f4dfba] text-[#4a3733] shadow-md scale-105"
      : "bg-[#f1f1f1] text-[#4a3733] border border-[#e5e5e5]";

  const backButtonStyle =
    "justify-self-start inline-flex items-center justify-center w-10 h-10 rounded-full text-[#f4dfba] hover:bg-[#f4dfba] hover:text-[#4a3733] transition-colors";

  return (
    <div className="w-full pb-2 px-7">
      <div className="grid grid-cols-5 gap-6 items-center w-full uppercase font-medium px-3">
        {/* Back Button */}
        <Link to="/userbook" className={backButtonStyle}>
          <ChevronLeft strokeWidth={3} size={20} />
        </Link>

        {/* Step 1 */}
        <div className={`${stepStyle} ${getStepStyle(1)}`}>Step 1</div>

        {/* Step 2 */}
        <div className={`${stepStyle} ${getStepStyle(2)}`}>Step 2</div>

        {/* Step 3 */}
        <div className={`${stepStyle} ${getStepStyle(3)}`}>Step 3</div>

        <div />
      </div>
    </div>
  );
};

export default StepByStep;
