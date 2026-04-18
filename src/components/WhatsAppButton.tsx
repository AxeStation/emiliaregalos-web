'use client'

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/522225011994"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg shadow-[#25D366]/30 hover:scale-110 transition-transform"
      aria-label="WhatsApp"
    >
      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
        <path d="M12 4a8 8 0 00-6.93 12l-1 3.6 3.7-1A8 8 0 1012 4zm4.6 11.1c-.2.5-1 1-1.4 1-.4 0-.7.1-2.2-.5-1.8-.7-3-2.6-3.1-2.7-.1-.1-.9-1.2-.9-2.3s.6-1.6.8-1.8c.2-.2.4-.3.6-.3h.4c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.5l-.3.4c-.1.1-.2.3-.1.5.2.3.7 1 1.4 1.6.8.7 1.5.9 1.8 1 .2.1.4 0 .5-.1l.5-.6c.1-.2.3-.2.5-.1l1.6.8c.2.1.3.2.3.4 0 .2-.1.6-.3 1.1z"/>
      </svg>
    </a>
  )
}
