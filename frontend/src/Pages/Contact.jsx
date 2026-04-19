import { Clock, Mail, MapPin, Phone } from "lucide-react";

const Contact = () => {
  const contactInfo = [
    { title: "PHONE NUMBER", value: "275003014", icon: Phone },
    { title: "EMAIL", value: "calidro.reservations@gmail.com", icon: Mail },
    {
      title: "LOCATION",
      value: "375 F. Antonio St. Malinao, Pasig City",
      icon: MapPin,
    },
    {
      title: "WORKING HOURS",
      value: (
        <div className="space-y-1">
          <p>Weekdays 8:00am – 9:00pm</p>
          <p>Weekends 8:00am – 11:00pm</p>
        </div>
      ),
      icon: Clock,
    },
  ];

  return (
    <section className="bg-[#F5F5F5] py-20 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {contactInfo.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="bg-[#433633] rounded-[40px] p-10
                         flex flex-col items-center justify-center
                         text-white text-center shadow-lg"
            >
              <Icon size={32} className="mb-4 text-[#f4dfba]" />

              <h3 className="font-bold text-lg mb-4 tracking-widest uppercase">
                {item.title}
              </h3>

              <div className="text-sm font-light tracking-wide">
                {item.value}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Contact;
