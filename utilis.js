function extractDatesFromNoteContent(content) {
    const datePattern = /\d{1,2}\/\d{1,2}\/\d{4}/g;
    return content.match(datePattern) || [];
}

export { extractDatesFromNoteContent };
