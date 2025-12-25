import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Facebook, Twitter, Instagram } from 'lucide-react';
import { useState } from "react";

const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="neon-box p-5 rounded-xl cursor-pointer transition-all"
      onClick={() => setOpen(!open)}
    >
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-foreground">
          {question}
        </h3>
        <span className="text-cyan-400 text-2xl">
          {open ? "-" : "+"}
        </span>
      </div>

      <div
        className={`text-muted-foreground text-sm mt-2 overflow-hidden transition-all duration-300 ${open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        {answer}
      </div>
    </div>
  );
};

const Contact = () => {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
            যোগাযোগ করুন
          </h1>
          <p className="text-muted-foreground text-lg">
            কোনো প্রশ্ন আছে? মতামত জানাতে চান? সাহায্য দরকার? আমাদের সাথে যোগাযোগ করুন—আমরা শুনতে প্রস্তুত!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center neon-title">
                যোগাযোগ করতে চাইলে
              </h2>

              <div className="space-y-4">

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                    <MapPin className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">ঠিকানা</h3>
                    <p className="text-muted-foreground">
                      Institute of Computer Science & Technology<br />
                      Dhaka, Bangladesh
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                    <Mail className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">ইমেইল</h3>
                    <p className="text-muted-foreground">icst69016@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                    <Phone className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">ফোন</h3>
                    <p className="text-muted-foreground">+880 1673-442353</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                    <Clock className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">অফিস সময়</h3>
                    <p className="text-muted-foreground">শনিবার - বৃহস্পতিবার: 8:00 AM - 5:00 PM</p>
                    <p className="text-muted-foreground">শুক্রবার - বন্ধ</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Social */}
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">আমাদের ফলো করুন</h2>
              <div className="flex gap-4">

                <a
                  href="https://www.facebook.com/profile.php?id=100086966421718"
                  className="p-4 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-all neon-border flex-1 flex items-center justify-center"
                >
                  <Facebook size={28} />
                </a>

                <a
                  href="http://twitter.com/"
                  className="p-4 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-all neon-border flex-1 flex items-center justify-center"
                >
                  <Twitter size={28} />
                </a>

                <a
                  href="#"
                  className="p-4 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-all neon-border flex-1 flex items-center justify-center"
                >
                  <Instagram size={28} />
                </a>

              </div>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8"
          >
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center neon-title">
              সাধারণ জিজ্ঞাসা
            </h2>

            <div className="space-y-6">

              <FAQItem
                question="কিভাবে একটি সমস্যা রিপোর্ট করব?"
                answer="'Submit' পেজে গিয়ে ফর্ম পূরণ করুন। সমস্যার বিস্তারিত লিখুন এবং প্রয়োজনে প্রমাণ লিংক যুক্ত করুন।"
              />

              <FAQItem
                question="সমস্যা জমা দেওয়ার পর কি হয়?"
                answer="আমি 24–48 ঘন্টার মধ্যে আপনার রিপোর্ট যাচাই করব এবং স্ট্যাটাস আপডেট করব। ইমেইলে নোটিফিকেশনও পাবেন।"
              />

              <FAQItem
                question="ভোটিং কিভাবে কাজ করে?"
                answer="প্রতিটি সমস্যায় Good বা Bad ভোট দিতে পারবেন। বেশি ভোট মানে বেশি অগ্রাধিকার।"
              />

              <FAQItem
                question="আমার তথ্য কি গোপনীয় থাকবে?"
                answer="হ্যাঁ, আপনার সমস্ত ব্যক্তিগত তথ্য নিরাপদ। শুধুমাত্র প্রয়োজন হলে প্রশাসনিক কাজে ব্যবহার হবে।"
              />

              <FAQItem
                question="সমস্যা সমাধান হতে কতদিন লাগে?"
                answer="জরুরি বিষয় আগে সমাধান হয়। তবে সমস্যা অনুযায়ী সময় ভিন্ন হতে পারে। আপডেট নিয়মিত দেয়া হবে।"
              />


            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
