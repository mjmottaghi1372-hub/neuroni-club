// =====================================================
// APP - راه‌اندازی اولیه
// =====================================================

// مقدار اولیه‌ی فلگ‌های global — قبل از هر بازی
window.isInAssessment = false;
window.isInDailyWorkout = false;
window.forceAssessmentLevel1 = false;

async function initApp() {
    try {
        await initState();
    } catch (e) {
        console.error('initState failed:', e);
        // fallback: از state.js use the default (که storage در اختیار می‌ذاره)
        // initState خودش fallback داره، پس این فقط برای امنیت است
    }

    try {
        history.replaceState({ page: 'menu' }, '');
        window.addEventListener('popstate', handlePopState);
        goToMenu();
    } catch (e) {
        console.error('initApp failed:', e);
        alert('خطا در بارگذاری اپ. لطفاً صفحه رو رفرش کن.');
    }
}

initApp();