import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  // Redirect to new onboarding flow
  useEffect(() => {
    navigate("/onboarding");
  }, [navigate]);

  return null;
};

export default RegisterPage;
