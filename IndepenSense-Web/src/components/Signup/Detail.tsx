import type { Guardian } from "./Signup";

type SetDetail = {
  guardian: Guardian;
  onSetCredential: React.Dispatch<React.SetStateAction<Guardian>>;
  onNext: (step: string) => void;
};

function Detail({ guardian, onSetCredential, onNext }: SetDetail) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    onSetCredential((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmission = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <div className="stack-container detail-component">
      <div
        className="back-button-container"
        onClick={() => onNext("credentials")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="0.5em"
          height="1em"
          viewBox="0 0 12 24"
        >
          <path d="M0 0h12v24H0z" fill="none" />
          <path
            fill="currentColor"
            fill-rule="evenodd"
            d="m3.343 12l7.071 7.071L9 20.485l-7.778-7.778a1 1 0 0 1 0-1.414L9 3.515l1.414 1.414z"
          />
        </svg>
      </div>
      <div className="message-container">
        <div className="icon-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
          >
            <path d="M0 0h24v24H0z" fill="none" />
            <path
              fill="currentColor"
              d="M12 22q-3.475-.875-5.738-3.988T4 11.1V5l8-3l8 3v6.1q0 3.8-2.262 6.913T12 22"
            />
          </svg>
        </div>
        <div className="message-information">
          <p>Your Information</p>
          <p>Enter your details</p>
        </div>
      </div>
      <div className="form-container">
        <form onSubmit={handleSubmission}>
          <div>
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Enter your full name"
              required
              value={guardian?.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email"
              required
              value={guardian?.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="contactNumber">Contact Number</label>
            <input
              type="tel"
              name="contactNumber"
              id="contactNumber"
              placeholder="+63"
              required
              value={guardian?.contactNumber}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="role">Role</label>
            <input
              type="text"
              name="role"
              id="role"
              placeholder="Enter your role"
              required
              value={guardian?.uuid}
              onChange={handleChange}
            />
          </div>
          <input
            className="submit-button"
            type="submit"
            value="Create account"
          />
        </form>
      </div>
    </div>
  );
}

export default Detail;
