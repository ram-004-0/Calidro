import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <div className="bg-[#f1f1f1] min-h-screen">
      <Outlet />
    </div>
  );
};

export default RootLayout;
