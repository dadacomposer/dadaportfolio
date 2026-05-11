'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

type FormData = {
  identity: string;
  projectName: string;
  needs: string[];
  budget: string;
  email: string;
  phone: string;
  message: string;
};

const STEPS = [
  { id: 'intro', type: 'welcome' },
  { id: 'identity', type: 'choice', question: "First, who are you?", options: ["Director / Editor", "Production Agency", "Brand / Commercial", "Independent Artist"] },
  { id: 'projectName', type: 'text', question: "What's the working title of your project?" },
  { id: 'needs', type: 'multiple', question: "What does the project need?", options: ["Custom Music / Scoring", "Sound Design / SFX", "Mixing & Mastering", "Full Audio Post-Production"] },
  { id: 'budget', type: 'choice', question: "Estimated budget range?", options: ["< €1,000", "€1,000 - €5,000", "€5,000 - €15,000", "€15,000+"] },
  { id: 'contact', type: 'email-phone', question: "Where can I reach you?" },
  { id: 'message', type: 'textarea', question: "Any specific sonic references or details?", optional: true },
  { id: 'thanks', type: 'success' }
];

export default function ContactForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    identity: '',
    projectName: '',
    needs: [],
    budget: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleChoice = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    setTimeout(nextStep, 400);
  };

  const handleMultipleChoice = (value: string) => {
    const newNeeds = formData.needs.includes(value)
      ? formData.needs.filter(n => n !== value)
      : [...formData.needs, value];
    setFormData({ ...formData, needs: newNeeds });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        nextStep();
      } else {
        const error = await response.json();
        alert(`Submission failed: ${error.error || 'Please check your connection.'}`);
      }
    } catch (error) {
      alert('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const step = STEPS[currentStep];
  const progress = ((currentStep) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-[90vh] w-full flex flex-col items-center justify-center relative overflow-hidden bg-deepblack text-white px-6">
      
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-5 pointer-events-none overflow-hidden">
        <span className="text-[40vw] font-bold tracking-tighter uppercase select-none opacity-20">Contact</span>
      </div>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-white/5 z-50">
        <motion.div 
          className="h-full bg-accent shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -30, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-col gap-8"
          >
            {/* Step Number & Back Button */}
            {currentStep > 0 && currentStep < STEPS.length - 1 && (
              <div className="flex items-center justify-between w-full">
                <button 
                  onClick={prevStep}
                  className="flex items-center gap-2 text-[10px] font-light tracking-[0.2em] uppercase text-white/40 hover:text-accent transition-colors"
                >
                  <ChevronLeft size={14} /> Back
                </button>
                <span className="text-[10px] font-light tracking-[0.5em] uppercase text-accent/60">
                  Question {currentStep} of {STEPS.length - 2}
                </span>
              </div>
            )}

            {/* WELCOME STEP */}
            {step.type === 'welcome' && (
              <div className="flex flex-col items-start gap-8">
                <h1 className="text-5xl md:text-8xl font-light tracking-tighter leading-none">
                  Let's start your <br /> <span className="text-accent">sonic journey.</span>
                </h1>
                <p className="text-gray-400 font-light text-lg max-w-md leading-relaxed">
                  Every great project starts with a conversation. Tell me about your vision.
                </p>
                <button 
                  onClick={nextStep}
                  className="group flex items-center gap-4 bg-white text-deepblack px-8 py-4 rounded-xl font-light tracking-widest uppercase hover:bg-accent hover:text-white transition-all text-sm"
                >
                  Start Consultation
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            {/* CHOICE STEP */}
            {step.type === 'choice' && (
              <div className="flex flex-col gap-10">
                <h2 className="text-4xl md:text-6xl font-light tracking-tight leading-tight">
                  {step.question}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {step.options?.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleChoice(step.id as keyof FormData, opt)}
                      className={`p-6 rounded-xl border text-left transition-all flex items-center justify-between group ${
                        formData[step.id as keyof FormData] === opt
                        ? 'bg-accent border-accent text-white'
                        : 'bg-white/5 border-white/10 hover:border-white/30 text-white'
                      }`}
                    >
                      <span className="font-light tracking-tight">{opt}</span>
                      <div className={`w-6 h-6 rounded-full border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${formData[step.id as keyof FormData] === opt ? 'opacity-100 bg-white/20' : ''}`}>
                        <Check className="w-3 h-3" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TEXT STEP */}
            {step.type === 'text' && (
              <div className="flex flex-col gap-10">
                <h2 className="text-4xl md:text-6xl font-light tracking-tight leading-tight">
                  {step.question}
                </h2>
                <div className="relative">
                  <input 
                    autoFocus
                    type="text" 
                    value={formData[step.id as keyof FormData] as string}
                    onChange={(e) => setFormData({ ...formData, [step.id]: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && formData[step.id as keyof FormData] && nextStep()}
                    placeholder="Type your answer here..."
                    className="w-full bg-transparent border-b border-white/20 py-4 text-2xl md:text-4xl font-light focus:outline-none focus:border-accent transition-colors placeholder:text-white/10"
                  />
                  {formData[step.id as keyof FormData] && (
                    <motion.button 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={nextStep}
                      className="absolute right-0 bottom-4 text-accent flex items-center gap-2 text-sm font-light tracking-widest uppercase"
                    >
                      Press Enter <ArrowRight size={16} />
                    </motion.button>
                  )}
                </div>
              </div>
            )}

            {/* MULTIPLE CHOICE STEP */}
            {step.type === 'multiple' && (
              <div className="flex flex-col gap-10">
                <h2 className="text-4xl md:text-6xl font-light tracking-tight leading-tight">
                  {step.question}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {step.options?.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleMultipleChoice(opt)}
                      className={`p-6 rounded-xl border text-left transition-all flex items-center justify-between group ${
                        formData.needs.includes(opt)
                        ? 'bg-accent/20 border-accent text-white'
                        : 'bg-white/5 border-white/10 hover:border-white/30 text-white'
                      }`}
                    >
                      <span className="font-light tracking-tight">{opt}</span>
                      <div className={`w-6 h-6 rounded-full border border-white/20 flex items-center justify-center transition-all ${formData.needs.includes(opt) ? 'bg-accent border-accent opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
                        <Check className="w-3 h-3" />
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex justify-start">
                  <button 
                    disabled={formData.needs.length === 0}
                    onClick={nextStep}
                    className="bg-white text-deepblack px-10 py-4 rounded-xl font-light tracking-widest uppercase hover:bg-accent hover:text-white transition-all text-sm disabled:opacity-20 disabled:pointer-events-none"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* EMAIL-PHONE STEP */}
            {step.type === 'email-phone' && (
              <div className="flex flex-col gap-10">
                <h2 className="text-4xl md:text-6xl font-light tracking-tight leading-tight">
                  {step.question}
                </h2>
                <div className="flex flex-col gap-8">
                  <input 
                    autoFocus
                    type="email" 
                    placeholder="email@address.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-transparent border-b border-white/20 py-4 text-2xl md:text-4xl font-light focus:outline-none focus:border-accent transition-colors placeholder:text-white/10"
                  />
                  <input 
                    type="tel" 
                    placeholder="+39 000 000 0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-transparent border-b border-white/20 py-4 text-2xl md:text-4xl font-light focus:outline-none focus:border-accent transition-colors placeholder:text-white/10"
                  />
                  <div className="flex justify-start">
                    <button 
                      disabled={!formData.email}
                      onClick={nextStep}
                      className="bg-white text-deepblack px-10 py-4 rounded-xl font-light tracking-widest uppercase hover:bg-accent hover:text-white transition-all text-sm disabled:opacity-20"
                    >
                      Almost there
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TEXTAREA STEP */}
            {step.type === 'textarea' && (
              <div className="flex flex-col gap-10">
                <h2 className="text-4xl md:text-6xl font-light tracking-tight leading-tight">
                  {step.question}
                </h2>
                <div className="flex flex-col gap-8">
                  <textarea 
                    autoFocus
                    rows={4}
                    placeholder="Feel free to share links, moodboards, or specific ideas..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-transparent border border-white/10 rounded-2xl p-6 text-xl md:text-2xl font-light focus:outline-none focus:border-accent transition-colors placeholder:text-white/10 resize-none"
                  />
                  <div className="flex justify-start">
                    <button 
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="bg-accent text-white px-10 py-4 rounded-xl font-light tracking-widest uppercase hover:scale-105 transition-all text-sm flex items-center gap-3"
                    >
                      {isSubmitting ? "Transmitting..." : "Send Request"}
                      {!isSubmitting && <ArrowRight size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUCCESS STEP */}
            {step.type === 'success' && (
              <div className="flex flex-col items-center text-center gap-8 py-10">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12 }}
                  className="w-24 h-24 rounded-full bg-accent/20 border border-accent flex items-center justify-center text-accent mb-4"
                >
                  <Check size={40} />
                </motion.div>
                <h1 className="text-5xl md:text-7xl font-light tracking-tighter leading-none">
                  Transmission <br /> <span className="text-accent">received.</span>
                </h1>
                <p className="text-gray-400 font-light text-lg max-w-md leading-relaxed">
                  I will review your project details and get back to you within 24 hours. 
                  Let's make something legendary.
                </p>
                <Link 
                  href="/"
                  className="mt-8 text-xs font-light tracking-[0.5em] uppercase text-white hover:text-accent transition-colors flex items-center gap-4"
                >
                  <ChevronLeft size={16} /> Back to home
                </Link>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      {currentStep > 0 && currentStep < STEPS.length - 1 && (
        <div className="fixed bottom-10 left-0 w-full flex justify-center px-6">
          <div className="flex items-center gap-6 bg-anthracite/40 backdrop-blur-xl border border-white/5 px-6 py-3 rounded-2xl">
            <button 
              onClick={prevStep}
              className="text-white/40 hover:text-white transition-colors"
            >
              <ChevronLeft size={24} strokeWidth={1} />
            </button>
            <div className="w-px h-6 bg-white/10" />
            <button 
              onClick={nextStep}
              disabled={!formData[step.id as keyof FormData] && step.type !== 'multiple'}
              className="text-white/40 hover:text-white transition-colors disabled:opacity-20"
            >
              <ChevronRight size={24} strokeWidth={1} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
