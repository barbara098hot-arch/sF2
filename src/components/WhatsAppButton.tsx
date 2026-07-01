import { MessageCircle } from 'lucide-react';
import { getWhatsAppNumber } from '../utils/contact';

export const WhatsAppButton = () => {
  const whatsapp = getWhatsAppNumber();
  return (
    <a
      href={`https://wa.me/${whatsapp}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#1ebd5a] transition-colors z-50 flex items-center justify-center"
      style={{ boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)' }}
    >
      <MessageCircle size={28} />
    </a>
  );
};
