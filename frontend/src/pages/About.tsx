import { motion } from 'framer-motion';
import { Target, Users, Lightbulb, Shield } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: Target,
      title: 'আমাদের লক্ষ্য',
      description: 'ক্যাম্পাস কমিউনিটির কণ্ঠস্বর শোনা এবং সমস্যা সমাধানে স্বচ্ছতা নিশ্চিত করা। আমরা বিশ্বাস করি যে প্রতিটি সমস্যা সমাধানের সুযোগ এবং প্রতিটি মতামত গুরুত্বপূর্ণ।',
    },
    {
      icon: Users,
      title: 'কমিউনিটি প্রথম',
      description: 'এই প্ল্যাটফর্ম শিক্ষার্থী, শিক্ষক এবং কর্মচারীদের জন্য। সবাই মিলে একসাথে একটি উন্নত প্রতিষ্ঠান গড়ে তুলতে পারি। আপনার অংশগ্রহণ পরিবর্তন আনে।',
    },
    {
      icon: Lightbulb,
      title: 'উদ্ভাবন',
      description: 'প্রযুক্তি ব্যবহার করে সমস্যা সমাধানের নতুন পথ খুঁজে বের করা। ডিজিটাল প্ল্যাটফর্মের মাধ্যমে দ্রুত এবং কার্যকর সমাধান প্রদান করা আমাদের লক্ষ্য।',
    },
    {
      icon: Shield,
      title: 'স্বচ্ছতা',
      description: 'প্রতিটি সমস্যার অগ্রগতি ট্র্যাক করুন এবং সমাধান প্রক্রিয়ায় অংশগ্রহণ করুন। খোলামেলা যোগাযোগ এবং জবাবদিহিতা আমাদের মূলমন্ত্র।',
    },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
            আইসিএসটি ইস্যু পোর্টাল কেন তৈরি হলো?
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            একটি স্বচ্ছ ও কার্যকর প্ল্যাটফর্ম যেখানে শিক্ষার্থীরা সমস্যার কথা বলতে পারেন এবং সমাধানের অগ্রগতি সরাসরি দেখতে পারেন—কারণ আপনার মতামত গুরুত্বপূর্ণ!
          </p>
        </motion.div>

        {/* Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 md:p-12 mb-12 max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-foreground mb-6">আমাদের গল্প</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              জানেন কি, প্রতিষ্ঠানের অর্ধেক সমস্যাই সমাধান হয় না শুধুমাত্র এজন্য যে কেউ সেগুলোকে গুরুত্ব দেয় না!
              তাই ICST Issue Portal তৈরি করা হয়েছে—যেন সবাই দেখে, সবাই জানে, এবং সবাই কাজও করে।
            </p>
            <p>
              এই প্ল্যাটফর্মে শিক্ষার্থী-কর্মচারী সবাই নিজেদের সমস্যা জানাতে পারেন,
              অন্যদের সমস্যায় ভোট দিতে পারেন,
              এবং শেষে স্বচ্ছভাবে দেখতে পারেন—
              প্রশাসন আসলে কাজ করছে নাকি শুধু পরিকল্পনা করছে!
            </p>
            <p>
              প্রযুক্তি ও মানুষের শক্তি একসাথে কাজ করলে কী ঘটে জানেন?
              প্রতিষ্ঠান আর পুরনো ধাঁচে আটকে থাকে না—
              একদম নতুন যুগের প্রতিষ্ঠান হয়ে ওঠে!
            </p>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="glass-card p-6 hover:neon-border transition-all"
            >
              <feature.icon className="text-primary mb-4" size={40} />
              <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-8 md:p-12"
        >
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">এটি কিভাবে কাজ করে</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
                1
              </div>
              <h4 className="font-semibold text-foreground mb-2">রিপোর্ট</h4>
              <p className="text-sm text-muted-foreground">সমস্যা রিপোর্ট করুন বিস্তারিত তথ্য সহ</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/20 border-2 border-secondary flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-secondary">
                2
              </div>
              <h4 className="font-semibold text-foreground mb-2">ভোট</h4>
              <p className="text-sm text-muted-foreground">গুরুত্বপূর্ণ সমস্যায় ভোট দিয়ে সমর্থন করুন</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-accent">
                3
              </div>
              <h4 className="font-semibold text-foreground mb-2">ট্র্যাক</h4>
              <p className="text-sm text-muted-foreground">সমাধান প্রক্রিয়া রিয়েল-টাইমে ট্র্যাক করুন</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-neon-green/20 border-2 border-neon-green flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-neon-green">
                4
              </div>
              <h4 className="font-semibold text-foreground mb-2">সমাধান</h4>
              <p className="text-sm text-muted-foreground">সমস্যার সমাধান দেখুন এবং ফলাফল যাচাই করুন</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
