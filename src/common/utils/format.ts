class Format {
    formatUID(uid: string) {
        const numbersOnly = uid.replace(/\D/g, '');
        const groups = numbersOnly.match(/.{1,4}/g) || [];
        return `${groups.join(' ')}`;
    }
}

export default new Format()