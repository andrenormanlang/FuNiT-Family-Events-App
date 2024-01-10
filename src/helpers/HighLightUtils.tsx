export const highlightUtils = (text: string, highlight: string) => {
    // Split on highlight term and include term into parts, ignore case
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
        <span>
            {parts.map((part, index) =>
                part.toLowerCase() === highlight.toLowerCase() ? (
                    <span key={index} style={{ backgroundColor: 'yellow' }}>
                        {part}
                    </span>
                ) : (
                    part
                )
            )}
        </span>
    );
};
