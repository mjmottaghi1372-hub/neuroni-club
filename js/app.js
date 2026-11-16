// =====================================================
// APP - راه‌اندازی اولیه
// =====================================================

async function initApp() {
    // ۱. لود کردن وضعیت از پایگاه داده
    await initState();

    // ۲. مدیریت دکمه Back مرورگر
    history.replaceState({ page: 'menu' }, '');
    window.addEventListener('popstate', handlePopState);

    // ۳. رفتن به منو (توابع داخل navigation.js آیکون‌ها را به درستی تنظیم می‌کنند)
    goToMenu();
}

initApp();