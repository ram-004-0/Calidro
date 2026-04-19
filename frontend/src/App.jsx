import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import { ChatProvider } from "./context/ChatContext";

import Login from "./Pages/Login";
import Landing from "./Pages/Landing";
import UserHome from "./User/UserHome";
import UserVirtualTour from "./User/UserVirtualTour";
import UserGallery from "./User/UserGallery";
import UserBook from "./User/UserBook";
import Booking from "./Booking Process/Booking";
import AdminOverview from "./Admin/AdminOverview";
import AdminHome from "./Admin/AdminHome";
import AdminGallery from "./Admin/AdminGallery";
import AdminBook from "./Admin/AdminBook";
import AdminReports from "./Admin/AdminReports";
import OverviewVirtualTour from "./Admin Overview/OverviewVirtualTour";
import OverviewAboutUs from "./Admin Overview/OverviewAboutUs";
import OverviewRatings from "./Admin Overview/OverviewRatings";
import OverviewEvents from "./Admin Overview/OverviewEvents";
import OverviewBook from "./Admin Overview/OverviewBook";
import OverviewContact from "./Admin Overview/OverviewContact";

import RootLayout from "./RootLayout";

import { AuthProvider } from "./context/AuthContext";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<Landing />} />
      <Route path="login" element={<Login />} />

      <Route path="userhome" element={<UserHome />} />
      <Route path="user-virtual-tour" element={<UserVirtualTour />} />
      <Route path="usergallery" element={<UserGallery />} />
      <Route path="userbook" element={<UserBook />} />
      <Route path="booking" element={<Booking />} />

      <Route path="admin-overview" element={<AdminOverview />} />
      <Route path="admin-home" element={<AdminHome />} />
      <Route path="admin-gallery" element={<AdminGallery />} />
      <Route path="admin-book" element={<AdminBook />} />
      <Route path="admin-reports" element={<AdminReports />} />

      <Route path="overview-aboutUs" element={<OverviewAboutUs />} />
      <Route path="overview-virtualTour" element={<OverviewVirtualTour />} />
      <Route path="overview-ratings" element={<OverviewRatings />} />
      <Route path="overview-events" element={<OverviewEvents />} />
      <Route path="overview-book" element={<OverviewBook />} />
      <Route path="overview-contact" element={<OverviewContact />} />
    </Route>,
  ),
);

const App = () => {
  return (
    <AuthProvider>
      <ChatProvider>
        <RouterProvider router={router} />
      </ChatProvider>
    </AuthProvider>
  );
};

export default App;
