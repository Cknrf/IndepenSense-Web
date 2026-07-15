import { useState } from "react";
import { useNavigate } from "react-router";
import LandingPage from "../components/Signup/LandingPage";
import AssistedUser from "../components/Signup/AssistedUser";
import LinkAssistedUser from "../components/Signup/LinkAssistedUser";

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
      {step === "link" && (
        <LinkAssistedUser onDone={() => navigate("/home")} />
      )}
    </div>
  );
}

export default Onboarding;
