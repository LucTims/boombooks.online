export const WHATSAPP_NUMBER = '237674246355';

/**
 * Returns a WhatsApp URL pre-filled with a custom message.
 * @param {string} [bookTitle] Optional book or item title
 * @returns {string} wa.me URL
 */
export function getBookWhatsAppLink(bookTitle) {
    const text = bookTitle && bookTitle.trim()
        ? `Bonjour, je suis intéressé(e) par le livre "${bookTitle.trim()}" sur BoomBooks.`
        : `Bonjour BoomBooks, je souhaite avoir des renseignements sur vos livres.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
