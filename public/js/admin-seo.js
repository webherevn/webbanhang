function analyzeSEO() {
    const keyword = $('#focusKeyword').val() ? $('#focusKeyword').val().toLowerCase().trim() : "";
    const title = $('input[name="title"]').val() || "";
    const summary = $('textarea[name="summary"]').val() || "";
    const contentHtml = $('#page-editor').summernote('code');
    const tempDiv = $('<div>').html(contentHtml); // Chuyển HTML thành DOM để dễ quét
    const plainText = tempDiv.text().toLowerCase();
    
    let seoScore = 0;
    let readabilityScore = 100;

    // Helper: Cập nhật UI
    function setStatus(selector, condition, points = 0) {
        const item = $(`.seo-item[data-check="${selector}"]`);
        if (condition && keyword !== "") {
            item.find('i').attr('class', 'fas fa-check-circle text-success');
            seoScore += points;
        } else {
            item.find('i').attr('class', 'fas fa-times-circle text-danger');
        }
    }

    // --- 1. KIỂM TRA SEO CƠ BẢN ---
    setStatus('title-length', title.length > 10 && title.length <= 60, 15);
    setStatus('desc-length', summary.length > 50 && summary.length <= 155, 10);
    
    const h1Count = tempDiv.find('h1').length;
    // Vì thông thường Title bài viết đã là H1 ngoài frontend, nên ở đây ta check H1 trong content
    setStatus('h1-check', h1Count === 0 || h1Count === 1, 10); 

    // Mật độ từ khóa
    const words = plainText.match(/\b\w+\b/g) || [];
    const wordCount = words.length;
    const keywordMatches = (plainText.match(new RegExp(keyword, 'g')) || []).length;
    const density = wordCount > 0 ? (keywordMatches / wordCount) * 100 : 0;
    setStatus('keyword-density', density >= 1 && density <= 2.5, 15);

    // --- 2. KIỂM TRA NÂNG CAO ---
    const subheadings = tempDiv.find('h2, h3').text().toLowerCase();
    setStatus('subheading-keyword', subheadings.includes(keyword), 10);

    const links = tempDiv.find('a');
    let hasInternal = false;
    let hasExternal = false;
    links.each(function() {
        const href = $(this).attr('href') || "";
        if (href.startsWith('http') && !href.includes(window.location.hostname)) hasExternal = true;
        else if (href.startsWith('/') || href.includes(window.location.hostname)) hasInternal = true;
    });
    setStatus('internal-link', hasInternal, 10);
    setStatus('external-link', hasExternal, 10);

    const imgAlts = tempDiv.find('img').map(function() { return $(this).attr('alt') || ""; }).get().join(" ");
    setStatus('img-alt-keyword', imgAlts.toLowerCase().includes(keyword), 20);

    // --- 3. ĐIỂM ĐỌC (READABILITY) ---
    // Luật 1: Câu quá dài (> 20 từ)
    const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let longSentences = sentences.filter(s => s.split(' ').length > 20).length;
    if (longSentences > sentences.length * 0.2) readabilityScore -= 20;

    // Luật 2: Đoạn văn quá dài (> 150 từ)
    tempDiv.find('p').each(function() {
        if ($(this).text().split(' ').length > 150) readabilityScore -= 10;
    });

    // CẬP NHẬT GIAO DIỆN TỔNG
    $('#seo-score-text').text(`${Math.round(seoScore)}/100`);
    
    let readText = "Tốt";
    if (readabilityScore < 50) readText = "Khó đọc";
    else if (readabilityScore < 80) readText = "Ổn";
    $('#readability-score-text').text(readText);

    // Cập nhật Emoji cảm xúc
    const emoji = $('#overall-emoji');
    if (seoScore >= 80) emoji.attr('class', 'fas fa-laugh-beam fa-2x text-success');
    else if (seoScore >= 50) emoji.attr('class', 'fas fa-smile fa-2x text-warning');
    else emoji.attr('class', 'fas fa-frown fa-2x text-danger');
}

// Kích hoạt lắng nghe
$(document).ready(function() {
    $('#focusKeyword, input[name="title"], textarea[name="summary"]').on('input', analyzeSEO);
    $('#page-editor').on('summernote.change', analyzeSEO);
    analyzeSEO();
});