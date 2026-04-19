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

  const faqs = [
    {
      keys: [
        "edit",
        "profile",
        "name",
        "pangalan",
        "number",
        "num",
        "address",
        "iedit",
        "personal",
        "details",
      ],
      ans: "Click the icon on the upper right corner then click edit profile. You will be able to change your personal details such as your name, number, and address.",
    },
    {
      keys: [
        "view",
        "viewing",
        "ocular",
        "makita",
        "visit",
        "site",
        "check",
        "in-person",
        "venue",
        "tour",
      ],
      ans: "Our website offers a 360 virtual tour in the 'Virtual' section. If you prefer to see the venue physically, you're very welcome to schedule an ocular visit! Just let me know and I'll escalate you to a live agent.",
    },
    {
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
      ],
      ans: "You can browse photos of our previous events in the Gallery section of our website. It showcases different events held at the venue with actual photos.",
    },
    {
      keys: [
        "book",
        "magbook",
        "booking",
        "reserve",
        "reservation",
        "procedure",
        "how",
        "steps",
      ],
      ans: "To book an event, simply go to the 'Book' section and fill out Step 1 (Booking Details) and Step 2 (Payment Details). Our team will review your request and guide you through the next steps.",
    },
    {
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
      ],
      ans: "Our standard package is ₱25,000 (4h event + 2h ingress + 1h egress). Extensions: Ingress/Egress is ₱1,000/hr, Event proper is ₱5,000/hr. A non-refundable ₱5,000 downpayment is required to confirm.",
    },
    {
      keys: [
        "pay",
        "magbayad",
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
      ],
      ans: "We use PayMongo for e-wallets and cards. Cash is accepted for the remaining balance but NOT for downpayments. Note: Bank transfers are unavailable 2 weeks before the event.",
    },
    {
      keys: ["rembal", "remaining", "balance", "bal"],
      ans: "Go to the 'Book' section, click your reservation, and select 'Update Payment' to see your balance. Please settle this before the event date!",
    },
    {
      keys: ["cancel", "cancellation", "policy", "refundable", "dp"],
      ans: "Cancellations must be made 2 weeks before the event. The ₱5,000 reservation fee is non-refundable, but any amount paid beyond that can be refunded.",
    },
    {
      keys: ["resched", "palipat", "date", "move", "reschedule"],
      ans: "Rescheduling is allowed up to 2 weeks before your event, depending on venue availability. You can do this in the 'Book' section under your reservation details.",
    },
    {
      keys: [
        "max",
        "maximum",
        "pax",
        "number",
        "guests",
        "ilan",
        "banquet",
        "standing",
        "cocktail",
      ],
      ans: "Capacity: Up to 180 guests for banquet-style (tables/chairs) and up to 250 guests for standing/cocktail setups.",
    },
    {
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
      ],
      ans: "The indoor area is approx 338 sqm. Overall dimensions are 58.7 ft x 62 ft, with the main hall measuring 43 ft x 62 ft.",
    },
    {
      keys: [
        "area",
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
      ],
      ans: "Venue Areas: Fountain entrance, Ground floor parking (15 cars), Service area, Restrooms (both floors), Reception area, Celebrant’s room, Main hall, and Emergency exit.",
    },
    {
      keys: ["submit", "review", "rate", "stars"],
      ans: "You can submit a 5-star review, write about your experience, and upload photos once your event is completed!",
    },
    {
      keys: ["loc", "san", "location", "saan", "pasig", "landmark", "address"],
      ans: "We are located at 375 F. Antonio St, Malinao, Pasig City, Philippines, near St. Gerrard and Pasig City Hall.",
    },
    {
      keys: ["num", "number", "contact", "phone", "email", "gmail"],
      ans: "Contact us at (02) 7500 3014 or calidro.reservations@gmail.com. You can also request a live agent right here!",
    },
    {
      keys: ["time", "working", "hours", "office", "oras", "bukas", "sara"],
      ans: "Office Hours: Mon-Sat (8am-5pm) and Sunday (1pm-5pm).",
    },
    {
      keys: [
        "duration",
        "venue",
        "open",
        "start",
        "earliest",
        "latest",
        "end",
        "extend",
      ],
      ans: "Earliest start: 8am (Mon-Sat) / 1pm (Sun). Latest start: 8pm. Standard duration is 4 hours proper + 3 hours for ingress/egress.",
    },
  ];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    sendMessage(trimmedInput, "user");
    setInput("");

    if (!isAdminMode) {
      const lowerInput = trimmedInput.toLowerCase();

      // Detection logic
      const match = faqs.find((f) =>
        f.keys.some((keyword) => lowerInput.includes(keyword.toLowerCase())),
      );

      setTimeout(() => {
        if (!isAdminMode) {
          if (match) {
            sendMessage(match.ans, "bot");
          } else {
            sendMessage(
              "I'm not sure about that. Would you like to talk to a live Admin?",
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
