import { useState } from "react";
import { useNavigate } from "react-router";
import LandingPage from "../components/Signup/LandingPage";
import AssistedUser from "../components/Signup/AssistedUser";

function Onboarding() {
  const [step, setStep] = useState<"landing" | "form">("landing");
  const navigate = useNavigate();

  return (
    <div className="sign-up-section section">
      {step === "landing" ? (
        <LandingPage onAdd={() => setStep("form")} />
      ) : (
        <AssistedUser onDone={() => navigate("/home")} />
      )}
    </div>
  );
}

export default Onboarding;
