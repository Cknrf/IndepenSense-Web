import { useState } from "react";
import Credential from "./Credential";
import Detail from "./Detail";

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

function Signup() {
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

  const [step, setStep] = useState<"credentials" | "details">("credentials");

  return (
    <div className="sign-up-section section">
      {step === "credentials" ? (
        <Credential
          guardian={guardian}
          onSetCredential={setGuardian}
          onNext={setStep}
        />
      ) : (
        <Detail
          guardian={guardian}
          onSetCredential={setGuardian}
          onBack={() => setStep("credentials")}
        />
      )}
    </div>
  );
}

export default Signup;
