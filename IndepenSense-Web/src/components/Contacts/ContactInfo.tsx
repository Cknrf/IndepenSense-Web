type ContactPerson = {

    name: string;
    role: string;
    contactNumber: number;

}

function ContactInfo(contactPerson: ContactPerson) {
    

    return(
        <div className="contact-container">
                <div className="picture-container"></div>
                <div className="contact-information">
                    <p className="name">{contactPerson.name}</p>
                    <p className="role">{contactPerson.role}</p>
                    <p className="number">{contactPerson.contactNumber}</p>
                </div>
        </div>
    );
}

export default ContactInfo;



