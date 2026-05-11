import ContactForm from '@/components/ContactForm';

export const metadata = {
  title: 'Contact | DADA.COMPOSER',
  description: 'Start your sonic journey. Reach out for custom music, sound design, and audio post-production.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <ContactForm />
    </div>
  );
}
