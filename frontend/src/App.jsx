import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { SkeletonTheme } from "react-loading-skeleton";

import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import OtpVerification from "./components/OtpVerification";
import Auth from "./pages/Auth";
import PrivateRoute from "./components/RedirectingComponents/PrivateRoute";
import RedirectRoute from "./components/RedirectingComponents/RedirectRoute";
import UploadPostPage from "./pages/UploadPostPage";
import LoadingPage from "./pages/LoadingPage";
import UniversityPage from "./pages/UniversityPage";
import { useDispatch, useSelector } from "react-redux";
import { setTheme } from "./redux/reducers/themeSlice";
import { createPost } from "./redux/actions/postAction";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import PasswordResetPage from "./pages/PasswordResetPage";

function App() {
  const [isUploadingPost, setIsUploadingPost] = useState(false);
  const dispatch = useDispatch();
  dispatch(setTheme());
  const { theme } = useSelector((state) => state.theme);

  const handleUpload = async (formData) => {
    setIsUploadingPost(true);
    try {
      await dispatch(createPost(formData));
    } catch (error) {
      console.log("Oops... A problem occurred while posting.", error);
    } finally {
      setIsUploadingPost(false);
    }
  };

  return (
    <SkeletonTheme
      baseColor={theme === "dark" ? "#313131" : "#d4d4d8"}
      highlightColor={theme === "dark" ? "#525252" : "#e8e5e5"}
    >
      <div className="bg-[#EDEDED] dark:bg-[#161616]">
        <Routes>
          {/* Protected Routes - Redirects to /auth if not logged in */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <HomePage isUploadingPost={isUploadingPost} />
              </PrivateRoute>
            }
          />
          <Route
            path="/post/:id"
            element={
              <PrivateRoute>
                <HomePage isUploadingPost={isUploadingPost} />
                {/* HomePage will conditionally show PostPage or PostGrid */}
              </PrivateRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <PrivateRoute>
                <UploadPostPage handleUpload={handleUpload} />
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />

          <Route
            path="/university"
            element={
              <PrivateRoute>
                <UniversityPage />
              </PrivateRoute>
            }
          />
          <Route path="/forgot-password" element={<ForgotPasswordPage />}>
            <Route path="verify-otp" element={<OtpVerification />} />
          </Route>
          <Route path="/reset-password" element={<PasswordResetPage />} />

          {/* Auth Route - Redirects to / if already logged in */}
          <Route
            path="/auth"
            element={
              <RedirectRoute>
                <Auth />
              </RedirectRoute>
            }
          >
            <Route path="verify-otp" element={<OtpVerification />} />
          </Route>
          <Route path="/loading" element={<LoadingPage />} />
        </Routes>
      </div>
    </SkeletonTheme>
  );
}

export default App;
