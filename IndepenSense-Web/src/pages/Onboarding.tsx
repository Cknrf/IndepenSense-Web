import { useState } from "react";
import { useNavigate } from "react-router";
import LandingPage from "../components/Signup/LandingPage";
import AssistedUser from "../components/Signup/AssistedUser";
import RedeemInvite from "../components/Signup/RedeemInvite";

function Onboarding() {
  const [step, setStep] = useState<"landing" | "create" | "link">("landing");
  const navigate = useNavigate();

  return (
    <div className="sign-up-section section">
      {step === "landing" && (
        <LandingPage
          onAdd={() => setStep("create")}
          onLink={() => setStep("link")}
        />
      )}
      {step === "create" && (
        <AssistedUser onDone={() => navigate("/home")} />
      )}
      {step === "link" && <RedeemInvite onDone={() => navigate("/home")} />}
    </div>
  );
}

export default Onboarding;
