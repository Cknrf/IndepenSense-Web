import { useState } from "react";
import Credential from "./Credential";
import Detail from "./Detail";

/**
 * Sign-up only creates the guardian. Assisted users are attached afterwards,
 * either by claiming a device with its pairing code or by redeeming an invite.
 */
export type Guardian = {
  name: string;
  role: string;
  contactNumber: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
};

function Signup() {
  const [guardian, setGuardian] = useState<Guardian>({
    name: "",
    role: "",
    contactNumber: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
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
