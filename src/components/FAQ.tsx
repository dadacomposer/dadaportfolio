'use client';
import { motion } from 'framer-motion';

const faqs = [
  {
    question: "Do you compose custom music for commercial campaigns?",
    answer: "Yes, I specialize in crafting bespoke neo-classical and electronic scores that perfectly align with your brand's identity and visual narrative."
  },
  {
    question: "What is included in the audio post-production package?",
    answer: "The complete package includes dialogue editing (VOX), sound design, foley recording, and a final mix/master optimized for your target platform (broadcast, cinema, web)."
  },
  {
    question: "How do revisions work?",
    answer: "Every project includes 2 comprehensive rounds of revisions. Additional revisions can be accommodated at an hourly rate to ensure you get the perfect sonic result."
  },
  {
    question: "Do you handle music licensing and buyouts?",
    answer: "Absolutely. I provide transparent buyout options for all original compositions, ensuring you have the full commercial rights needed for your campaign's distribution."
  }
];

export default function FAQ() {


  return (
    <div className="w-full max-w-3xl mx-auto py-24 px-6">
      <motion.h2 
        className="text-4xl font-light tracking-tight text-white mb-10 text-center"
        initial={{ opacity: 0, y: 30, filter: "blur(15px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        viewport={{ once: true, margin: "-100px" }}
      >
        Frequently Asked Questions
      </motion.h2>
      
      <div className="flex flex-col gap-16 md:gap-24">
        {faqs.map((faq, index) => {
          return (
            <div 
              key={index} 
              className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-4 md:gap-16 border-t border-white/5 pt-8 md:pt-12 group"
            >
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-accent uppercase tracking-[0.4em] mb-2 opacity-50">Question 0{index + 1}</span>
                <h3 className="font-light text-xl md:text-2xl text-white tracking-tight leading-snug group-hover:text-accent transition-colors duration-700">
                  {faq.question}
                </h3>
              </div>
              
              <div className="flex flex-col justify-end">
                <p className="text-gray-500 font-light text-sm md:text-base leading-relaxed max-w-xl">
                  {faq.answer}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
