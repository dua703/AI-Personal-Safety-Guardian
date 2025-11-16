'use client';

import { useEffect } from 'react';

interface Contact {
  name: string;
  phone: string;
}

interface EmergencyContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts?: Contact[];
}

const defaultContacts: Contact[] = [
  { name: 'Mom', phone: '+1234567890' },
  { name: 'Friend', phone: '+1234567891' },
  { name: 'Partner', phone: '+1234567892' },
];

export default function EmergencyContactsModal({
  isOpen,
  onClose,
  contacts = defaultContacts,
}: EmergencyContactsModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatPhoneForWhatsApp = (phone: string) => {
    // Remove all non-digit characters
    return phone.replace(/\D/g, '');
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Semi-transparent dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm" />

      {/* Modal Content */}
      <div
        className="relative bg-white rounded-xl shadow-lg border border-pink-200 w-full max-w-md animate-slide-up-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-pink-100">
          <h2 className="text-2xl font-bold text-gray-800">Emergency Contacts</h2>
        </div>

        {/* Contacts List */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            {contacts.map((contact, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-pink-50 rounded-lg border border-pink-200"
              >
                <div className="flex-1">
                  <p className="text-lg font-semibold text-gray-800">{contact.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{contact.phone}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {/* Call Button */}
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center justify-center w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-md transition-all duration-200 hover:scale-110"
                    aria-label={`Call ${contact.name}`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </a>

                  {/* WhatsApp Button */}
                  <a
                    href={`https://wa.me/${formatPhoneForWhatsApp(contact.phone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full shadow-md transition-all duration-200 hover:scale-110"
                    aria-label={`WhatsApp ${contact.name}`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <div className="px-6 py-4 border-t border-pink-100">
          <button
            onClick={onClose}
            className="w-full bg-button-primary hover:bg-button-primary-hover text-white rounded-xl px-6 py-3 font-semibold shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

