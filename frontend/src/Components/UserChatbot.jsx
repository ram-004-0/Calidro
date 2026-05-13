import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, X, Headset } from "lucide-react";
import { useChat } from "../context/ChatContext";

const UserChatbot = () => {
  const {
    sendMessage,
    messages,
    isChatOpen,
    setIsChatOpen,
    isAdminMode,
    startLiveChat,
  } = useChat();

  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  // EXPANDED FAQS BASED ON YOUR C# DATA
  const faqs = [
    {
      id: "edit_profile",
      keys: [
        "edit",
        "change",
        "update",
        "magpalit",
        "palit",
        "palitan",
        "profile",
        "name",
        "pangalan",
        "number",
        "num",
        "address",
        "personal",
        "details",
        "information",
        "info",
        "account",
        "modify",
        "baguhin",
      ],
      ans: "Click the icon on the upper left corner then click edit profile. You will be able to change your personal details such as your name, number, and address.",
    },
    {
      id: "ocular_view",
      keys: [
        "view",
        "viewing",
        "ocular",
        "site",
        "visit",
        "makita",
        "booking",
        "inspect",
        "schedule",
        "venue",
        "pwede",
        "see",
        "place",
        "check",
        "personally",
        "tour",
        "first",
      ],
      ans: "Our website offers a 360 virtual tour showcasing the events place. This feature lets you explore the venue online as if you're physically there.\n\nClick the Virtual section and navigate around the area.\n\nIf you prefer to see the venue physically, you're very welcome to schedule an ocular visit with us. Just let us know and I'll escalate you to a live agent.",
    },
    {
      id: "previous_events",
      keys: [
        "setup",
        "sample",
        "pics",
        "pictures",
        "photos",
        "images",
        "gallery",
        "album",
        "event",
        "past",
        "previous",
        "actual",
        "real",
        "where",
        "see",
        "view",
        "venue",
        "portfolio",
      ],
      ans: "You can browse photos of our previous events in the Gallery section of our website.\n\nOur gallery showcases different events held at the venue, including a short description and actual photos.",
    },
    {
      id: "booking_process",
      keys: [
        "how",
        "book",
        "magbook",
        "booking",
        "bookings",
        "reserve",
        "reservation",
        "reservations",
        "procedure",
        "steps",
        "process",
        "check",
        "see",
        "make",
        "event",
        "place",
        "instruction",
        "instructions",
        "secure",
        "venue",
        "slot",
      ],
      ans: "To book an event with us, simply go to the Book section, click create new booking, and fill out the Booking (Step 1) and Payment Details (Step 2).\n\nOnce submitted, the date is automatically reserved for you.\n\nGo back to the Book section to check your reservations made.",
    },
    {
      id: "pricing_inquiry",
      keys: [
        "hm",
        "much",
        "price",
        "pricing",
        "magkano",
        "rental",
        "fee",
        "downpayment",
        "payment",
        "bayad",
        "cost",
        "rates",
        "quotation",
        "budget",
        "starting",
        "package",
      ],
      ans: "Our standard event package is ₱25,000, which includes a 4-hour event proper, plus 2 hours free ingress and 1 hour free egress.\n\nExtensions:\nIngress/Egress: ₱1,000/hr\nEvent proper: ₱5,000/hr\n\nPlease note that a ₱5,000 non-refundable downpayment is required to confirm.",
    },
    {
      id: "payment_process",
      keys: [
        "how",
        "pay",
        "magbayad",
        "payment",
        "method",
        "mop",
        "card",
        "gcash",
        "online",
        "banking",
        "bank",
        "babayaran",
        "settle",
        "installment",
        "full",
        "steps",
        "process",
        "complete",
        "make",
        "bayaran",
        "bayad",
        "dp",
      ],
      ans: "Go to the Book section and accomplish the steps. We use PayMongo (E-wallets, cards, online banking). We accept cash for the remaining balance, but NOT for downpayments.\n\nNote: Online banking is unavailable 2 weeks before the event. After successful payment, the date is automatically reserved.",
    },
    {
      id: "remaining_balance",
      keys: [
        "rembal",
        "remaining",
        "balance",
        "bal",
        "magkano",
        "babayaran",
        "pay",
        "bayad",
        "payment",
        "bayaran",
        "magbayad",
        "natira",
        "settle",
        "rest",
        "kulang",
        "how",
      ],
      ans: "Go to the Book section and find your reservation. Click on it and then select update payment. The system will show the payment summary, including the remaining balance.\n\nPlease settle this before your event!",
    },
    {
      id: "cancellation_policy",
      keys: [
        "cancel",
        "cancellation",
        "policy",
        "refundable",
        "dp",
        "remove",
        "delete",
        "void",
      ],
      ans: "Cancellations must be made 2 weeks before your scheduled event date. The 5000 pesos down payment is non-refundable. However, any amount paid beyond the reservation fee can still be refunded. If you have a refund concern, please contact the admin directly.",
    },
    {
      id: "reschedule_event",
      keys: [
        "resched",
        "iresched",
        "palipat",
        "ipalipat",
        "date",
        "move",
        "imove",
        "reschedule",
        "change",
        "schedule",
        "time",
        "duration",
        "transfer",
        "shift",
      ],
      ans: "Rescheduling must be made 2 weeks before your scheduled event date. You may choose a new date depending on the availability of our schedule. Note that you may only retain or increase the duration of your booking hours from your original reservation; reducing is not allowed.",
    },
    {
      id: "capacity_setup",
      keys: [
        "max",
        "maximum",
        "pax",
        "number",
        "guests",
        "ilan",
        "banquet",
        "standing",
        "seating",
        "cocktail",
        "capacity",
        "setup",
        "accommodate",
        "people",
        "hold",
        "limit",
        "attend",
        "occupancy",
      ],
      ans: "Our venue capacity:\n- Banquet-style: Up to 180 guests\n- Standing/Cocktail: Up to 250 guests",
    },
    {
      id: "dimensions",
      keys: [
        "kalaki",
        "sqm",
        "sukat",
        "size",
        "maliit",
        "malaki",
        "kaliit",
        "dimensions",
        "width",
        "length",
        "venue",
        "gaano",
        "gano",
        "big",
        "small",
        "area",
        "space",
        "coverage",
      ],
      ans: "The indoor area is approximately 338 sqm. Overall dimensions: 58.7 ft by 62 ft. Main hall: 43 ft by 62 ft.",
    },
    {
      id: "areas_available",
      keys: [
        "area",
        "areas",
        "parking",
        "slots",
        "cr",
        "restrooms",
        "reception",
        "room",
        "main",
        "hall",
        "emergency",
        "floor",
        "prep",
        "bridal",
        "sections",
        "parts",
        "locations",
      ],
      ans: "The venue includes: Fountain entrance, Parking (15 cars), Service area, Restrooms, Reception area, Celebrant’s room, Main event hall, and Emergency exit.",
    },
    {
      id: "reviews",
      keys: [
        "submit",
        "review",
        "leave",
        "feedback",
        "rate",
        "service",
        "experience",
        "post",
        "share",
        "write",
      ],
      ans: "You can submit a review after your event is completed! You may rate us up to 5 stars, write a description, and upload photos of your experience.",
    },
    {
      id: "location",
      keys: [
        "loc",
        "location",
        "saan",
        "pasig",
        "landmark",
        "address",
        "located",
        "where",
        "exact",
        "find",
        "situated",
        "san",
        "banda",
        "pumunta",
        "directions",
      ],
      ans: "We are located at 375 F. Antonio St, Malinao, Pasig City, Philippines, near St. Gerrard and Pasig City Hall.",
    },
    {
      id: "contacts",
      keys: [
        "num",
        "contact",
        "phone",
        "number",
        "email",
        "gmail",
        "message",
        "call",
        "talk",
        "your",
        "niyo",
      ],
      ans: "Contact us at 02 7500 3014 or email calidro.reservations@gmail.com. You can also request to be connected to a live agent here.",
    },
    {
      id: "working_hrs",
      keys: [
        "time",
        "working",
        "hours",
        "office",
        "oras",
        "bukas",
        "sara",
        "business",
        "opening",
        "open",
        "weekdays",
        "weekends",
        "hrs",
        "operating",
      ],
      ans: "Office Hours:\nMonday to Saturday: 8am - 5pm\nSunday: 1pm - 5pm",
    },
    {
      id: "venue_availability",
      keys: [
        "standard",
        "duration",
        "open",
        "start",
        "earliest",
        "latest",
        "end",
        "extend",
        "available",
        "slot",
        "vacant",
        "availability",
        "free",
      ],
      ans: "Go to the Book section and check our available dates in real time through our booking calendar.\nWe are open for bookings every day of the week.\nMonday to Saturday: Events can start as early as 8:00 AM\nSunday: Events can start as early as 1:00 PM\nOur standard event duration is 4 hours for the event proper, 2 hours ingress and 1 hour egress.\nThe latest allowable start time for events is 8:00 PM. Events may extend past midnight, provided there is no booking scheduled for the following day.",
    },
    {
      id: "policies",
      keys: [
        "policy",
        "policies",
        "rule",
        "rules",
        "terms",
        "conditions",
        "guidelines",
      ],
      ans: "Here are our general guidelines:\n\nBooking Confirmation: To secure a reservation, it is required to make a down payment of at least 5000 pesos. Once the payment pushed through, the date you booked it automatically reserved for you.\n\nCancellations: Cancellations must be made 2 weeks before your scheduled event date. The 5000 pesos down payment is non-refundable. However, any amount paid beyond the reservation fee can still be refunded. If you have a refund concern, please contact the admin directly.\n\nReschedule: Rescheduling must be made 2 weeks before your scheduled event date. You may choose a new date depending on the availability of our schedule. Note that you may only retain or increase the duration of your booking hours from your original reservation; reducing is not allowed.\n\nAvailability: All bookings are first-come, first-served based on real-time schedule availability.",
    },
  ];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isChatOpen && messages.length === 0) {
      const welcomeText =
        "Hi, I’m Calidro Bot! Feel free to ask me a question.\n\nIf ever I can’t help with your concern, you may also request a live agent during office hours (8:00 AM - 5:00 PM) by typing “admin”.";
      const timer = setTimeout(() => {
        sendMessage(welcomeText, "bot");
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isChatOpen, messages.length, sendMessage]);

  const handleSend = () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    sendMessage(trimmedInput, "user");
    setInput("");

    if (!isAdminMode) {
      const lowerInput = trimmedInput.toLowerCase();
      let bestMatch = null;
      let highestScore = 0;

      faqs.forEach((faq) => {
        let score = 0;
        faq.keys.forEach((key) => {
          if (lowerInput.includes(key.toLowerCase())) {
            score++;
          }
        });

        if (score > highestScore) {
          highestScore = score;
          bestMatch = faq;
        }
      });

      setTimeout(() => {
        if (!isAdminMode) {
          if (bestMatch && highestScore > 0) {
            sendMessage(bestMatch.ans, "bot");
          } else {
            sendMessage(
              "I'm sorry, I don't quite understand that. Would you like to talk to a live Admin?",
              "bot",
              true,
            );
          }
        }
      }, 600);
    }
  };

  if (!isChatOpen) return null;

  return (
    <div className="fixed bottom-24 right-10 w-80 h-[450px] bg-white shadow-2xl rounded-3xl flex flex-col z-[100] border border-gray-200 overflow-hidden text-xs transition-all">
      {/* Header */}
      <div className="bg-[#4a3733] p-4 text-[#f4dfba] flex justify-between items-center font-bold">
        <div className="flex items-center gap-2 uppercase tracking-widest">
          {isAdminMode ? <Headset size={18} /> : <Bot size={18} />}
          {isAdminMode ? "Live Support" : "Calidro Bot"}
        </div>
        <X
          className="cursor-pointer hover:opacity-70"
          size={18}
          onClick={() => setIsChatOpen(false)}
        />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 no-scrollbar">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`p-3 rounded-2xl max-w-[85%] shadow-sm whitespace-pre-line ${
                m.sender === "user"
                  ? "bg-[#4a3733] text-white rounded-tr-none"
                  : "bg-white text-gray-700 border rounded-tl-none"
              }`}
            >
              <p>{m.text}</p>
              {m.isSystem && !isAdminMode && m.sender === "bot" && (
                <button
                  onClick={startLiveChat}
                  className="mt-3 pt-2 border-t w-full text-[#4a3733] font-bold uppercase text-[10px] hover:underline flex items-center justify-center gap-1"
                >
                  <Headset size={12} /> Connect to Live Admin
                </button>
              )}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={isAdminMode ? "Type to Admin..." : "Ask a question..."}
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-[#4a3733]/20"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="bg-[#4a3733] text-white p-2 rounded-full disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
};

export default UserChatbot;
