import React from "react";
import { motion } from "framer-motion";
import { Send, Mail, Phone } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="py-24 relative bg-surface/50">
      <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-heading font-bold  mb-4">
            Get In Touch
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl font-heading font-bold  mb-6">
              Let's build something{" "}
              <span className="text-gradient">amazing</span> together.
            </h3>
            <p className="text-muted-force text-lg leading-relaxed mb-10">
              If you like my work and want to offer me a job or consider me for
              an interview, drop me a message. I'm always open to discussing new
              projects, creative ideas, or opportunities to be part of your
              visions.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface border border-textMain/5 flex items-center justify-center text-primary">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-sm text-muted-force">Email Me At</p>
                  <p className="font-semibold ">kaileshwaranp13@gmail.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface border border-textMain/5 flex items-center justify-center text-primary">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-sm text-muted-force">Call Me At</p>
                  <p className="font-semibold ">+91 948-844-5184</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6 }}
          >
            <form
              action="https://formspree.io/f/xkndaenn"
              method="POST"
              className="theme-card p-5 md:p-8 rounded-2xl"
            >
              <div className="mb-6">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-muted-force mb-2"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full bg-background border border-textMain/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="Your Name"
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-muted-force mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="_replyto"
                  required
                  className="w-full bg-background border border-textMain/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="youremail@example.com"
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-muted-force mb-2"
                >
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  required
                  className="w-full bg-background border border-textMain/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                  placeholder="Your Message"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-primary hover:bg-blue-600  font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                Send Message <Send size={18} />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
