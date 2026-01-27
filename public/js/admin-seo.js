/**
 * Logic phân tích SEO cho CMS
 */
function analyzeSEO() {
    // Lấy từ khóa tập trung
    const keyword = $('#focusKeyword').val() ? $('#focusKeyword').val().toLowerCase() : "";
    
    // Lấy tiêu đề bài viết/sản phẩm
    const title = $('input[name="title"]').val() ? $('input[name="title"]').val().toLowerCase() : "";
    
    // Lấy nội dung từ Summernote (nếu có)
    const content = $('#page-editor').length ? $('#page-editor').summernote('code').toLowerCase() : "";
    
    // Lấy mô tả/tóm tắt
    const summary = $('textarea[name="summary"]').val() ? $('textarea[name="summary"]').val().toLowerCase() : "";
    
    let score = 0;
    const totalChecks = 5;

    function updateStatus(selector, condition) {
        const item = $(`.seo-item[data-check="${selector}"]`);
        if (item.length) {
            if (condition && keyword.length > 0) {
                item.find('i').attr('class', 'fas fa-check-circle text-success');
                score += (100 / totalChecks);
            } else {
                item.find('i').attr('class', 'fas fa-times-circle text-danger');
            }
        }
    }

    if (keyword.length > 0) {
        // 1. Từ khóa trong tiêu đề
        updateStatus('title-keyword', title.includes(keyword));

        // 2. Độ dài nội dung (>300 từ)
        const textContent = content.replace(/<[^>]*>/g, '');
        const wordCount = textContent.trim().split(/\s+/).length;
        updateStatus('content-length', wordCount >= 300);

        // 3. Từ khóa trong mô tả
        updateStatus('desc-keyword', summary.includes(keyword));

        // 4. Từ khóa trong Slug (giả lập qua Title)
        updateStatus('slug-keyword', title.includes(keyword));

        // 5. Ảnh có Alt từ khóa
        updateStatus('img-alt', content.includes('alt=') && content.includes(keyword));
    }

    // Cập nhật thanh tiến độ và con số
    $('#seo-score-text').text(`${Math.round(score)}/100`);
    $('#seo-progress-bar').css('width', `${score}%`);
    
    // Đổi màu thanh tiến độ theo điểm số
    const bar = $('#seo-progress-bar');
    if(score < 50) bar.removeClass('bg-warning bg-success').addClass('bg-danger');
    else if(score < 80) bar.removeClass('bg-danger bg-success').addClass('bg-warning');
    else bar.removeClass('bg-danger bg-warning').addClass('bg-success');
}

// Lắng nghe sự kiện để cập nhật thời gian thực
$(document).ready(function() {
    $('#focusKeyword, input[name="title"], textarea[name="summary"]').on('input', analyzeSEO);
    $('#page-editor').on('summernote.change', analyzeSEO);
    
    // Chạy phân tích lần đầu khi load trang (cho trường hợp Sửa bài viết)
    analyzeSEO();
});