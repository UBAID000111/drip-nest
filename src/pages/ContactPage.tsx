import React, { useState } from 'react';
import { Mail, Phone, ShieldCheck, Send, CheckCircle, Clock } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Open default mail client with formatted message
    const mailtoUrl = `mailto:ubaidji07@gmail.com?subject=${encodeURIComponent(
      subject || 'DripNest Homeware Inquiry'
    )}&body=${encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    )}`;
    window.location.href = mailtoUrl;
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      <div className="max-w-3xl">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#684631] block mb-1">
          Direct Communication
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#234737]">
          Connect With DripNest
        </h1>
        <p className="text-sm sm:text-base text-[#252A24]/80 mt-2 leading-relaxed">
          Whether you have an inquiry about a handcrafted piece, custom dining order, or care guidance, we are delighted to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#EFE6D7] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="font-serif text-xl font-semibold text-[#234737]">
              Contact Details
            </h2>

            <div className="space-y-5 text-sm text-[#252A24]/85">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#EFE6D7] text-[#234737] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs uppercase tracking-wider text-[#684631] font-semibold">
                    Email Inquiries
                  </span>
                  <a
                    href="mailto:ubaidji07@gmail.com"
                    className="font-medium text-[#234737] hover:underline"
                  >
                    ubaidji07@gmail.com
                  </a>
                  <span className="block text-xs text-[#252A24]/60 mt-0.5">
                    Replies typically within 24 hours
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#EFE6D7] text-[#234737] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs uppercase tracking-wider text-[#684631] font-semibold">
                    Telephone Assistance
                  </span>
                  <a
                    href="tel:8218167743"
                    className="font-medium text-[#234737] hover:underline"
                  >
                    8218167743
                  </a>
                  <span className="block text-xs text-[#252A24]/60 mt-0.5">
                    Monday to Saturday, 10 AM – 7 PM IST
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#EFE6D7] text-[#234737] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs uppercase tracking-wider text-[#684631] font-semibold">
                    Registered GSTIN
                  </span>
                  <span className="font-mono text-xs font-semibold text-[#252A24]">
                    07AMVPU8369D1Z5
                  </span>
                  <span className="block text-xs text-[#252A24]/60 mt-0.5">
                    Verified business registration
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#EFE6D7] flex items-center gap-2 text-xs text-[#252A24]/70">
              <Clock className="w-4 h-4 text-[#684631]" />
              <span>Direct craft advisory & order support</span>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="lg:col-span-7 bg-white border border-[#EFE6D7] rounded-xl p-6 sm:p-10 shadow-xs">
          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-semibold text-[#234737]">
                Message Initialized
              </h3>
              <p className="text-sm text-[#252A24]/75 max-w-md mx-auto leading-relaxed">
                Your email client was opened with your message. If it did not launch automatically, feel free to write directly to{' '}
                <a href="mailto:ubaidji07@gmail.com" className="text-[#234737] font-semibold underline">
                  ubaidji07@gmail.com
                </a>.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-4 px-6 py-2.5 bg-[#234737] text-white text-xs uppercase tracking-wider font-semibold rounded-md"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="font-serif text-2xl font-semibold text-[#234737] mb-2">
                Send an Inquiry
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Maya Rao"
                    className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24] focus:outline-none focus:border-[#234737] focus:ring-1 focus:ring-[#234737]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="maya@example.com"
                    className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24] focus:outline-none focus:border-[#234737] focus:ring-1 focus:ring-[#234737]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Inquiry regarding handcrafted wooden tableware"
                  className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24] focus:outline-none focus:border-[#234737] focus:ring-1 focus:ring-[#234737]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                  Message *
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about the pieces you are interested in or any questions you have..."
                  className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24] focus:outline-none focus:border-[#234737] focus:ring-1 focus:ring-[#234737]"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#234737] text-white text-xs uppercase tracking-widest font-semibold rounded-md hover:bg-[#1A3529] transition-colors shadow-xs inline-flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Inquiry</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
