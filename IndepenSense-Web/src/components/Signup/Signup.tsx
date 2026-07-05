import { useState } from "react";
import Credential from "./Credential";
import Detail from "./Detail";
import LandingPage from "./LandingPage";

type SetActiveSection = {
  onSetActiveSection: (section: string) => void;
};

export type Guardian = {
  name: string;
  assisstedUserID: number;
  role: string;
  contactNumber: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  uuid: string;
};

function Signup({ onSetActiveSection }: SetActiveSection) {
  const [guardian, setGuardian] = useState<Guardian>({
    name: "",
    assisstedUserID: 0,
    role: "",
    contactNumber: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    uuid: "",
  });

  const [step, setStep] = useState("detailss");

  if (step === "credentials") {
    return (
      <div className="sign-up-section section">
        <Credential
          guardian={guardian}
          onSetCredential={setGuardian}
          onNext={setStep}
          onSetActiveSection={onSetActiveSection}
        ></Credential>
      </div>
    );
  } else if (step === "details") {
    return (
      <div className="sign-up-section section">
        <Detail
          guardian={guardian}
          onSetCredential={setGuardian}
          onNext={setStep}
        ></Detail>
      </div>
    );
  } else {
    return (
      <div className="sign-up-section section">
        <LandingPage></LandingPage>
      </div>
    );
  }
}

export default Signup;
