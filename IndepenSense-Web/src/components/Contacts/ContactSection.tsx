import MessageContainer from "./Message";
import ContactSummary from "./ContactSummary";
import ContactInfo from "./ContactInfo";

function ContactSection() {

    return(
        <div className="contact-section section">
            <div className="stack-container">
              <MessageContainer name={"Yoruuuu"}>
              </MessageContainer>
            </div>

            <div className="stack-container">
                <ContactSummary userName="Yoruuuu" totalGuardian={4}>
                </ContactSummary>
            </div>

            <div className="stack-container">
              <div className="contact-list-container">
                    <ContactInfo
                    name="Juan Dela Cruz"
                    role="Primary Guardian"
                    contactNumber={9482548292}
                    ></ContactInfo>
              </div>
            </div>

        </div>
    );


}

export default ContactSection;