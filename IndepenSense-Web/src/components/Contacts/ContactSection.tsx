import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { API_BASE } from "../../utils/api";
import MessageContainer from "./Message";
import ContactSummary from "./ContactSummary";
import ContactInfo from "./ContactInfo";

type Contact = {
  name: string;
  role: string;
  contactNumber: string;
};

function ContactSection() {
  const { activeAssistedUser, setUser } = useAuth();
  const assistedUserID = activeAssistedUser?.id;
  const assistedName = activeAssistedUser?.name ?? "";
  const [contacts, setContacts] = useState<Contact[] | null>(null);

  useEffect(() => {
    setContacts(null);
    if (!assistedUserID) return;

    async function fetchContacts() {
      const response = await fetch(
        `${API_BASE}/contacts/${assistedUserID}`,
        { credentials: "include" },
      );
      if (response.status === 401) {
        setUser(null);
        return;
      }
      if (!response.ok) return;
      const data = (await response.json()) as Contact[];
      setContacts(data);
    }

    fetchContacts();
  }, [assistedUserID, setUser]);

  const totalGuardian = contacts === null ? 0 : contacts.length + 1;

  return (
    <div className="contact-section section">
      <div className="stack-container">
        <MessageContainer name={assistedName}></MessageContainer>
      </div>

      <div className="stack-container">
        <ContactSummary
          userName={assistedName}
          totalGuardian={totalGuardian}
        ></ContactSummary>
      </div>

      <div className="stack-container">
        <div className="contact-list-container">
          {contacts === null ? (
            <p>Loading contacts…</p>
          ) : contacts.length === 0 ? (
            <p>No other guardians linked yet.</p>
          ) : (
            contacts.map((contact, i) => (
              <ContactInfo
                key={`${contact.name}-${contact.contactNumber}-${i}`}
                name={contact.name}
                role={contact.role}
                contactNumber={contact.contactNumber}
              ></ContactInfo>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ContactSection;
