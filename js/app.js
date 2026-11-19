// =====================================================
// APP - راه‌اندازی اولیه
// =====================================================

window.isInAssessment = false;
window.isInDailyWorkout = false;
window.forceAssessmentLevel1 = false;

// =====================================================
// APP - راه‌اندازی اولیه
// =====================================================

window.isInAssessment = false;
window.isInDailyWorkout = false;
window.forceAssessmentLevel1 = false;

async function initApp() {
    try {
        await initState();
    } catch (e) {
        console.error('initState failed:', e);
    }

    try {
        history.replaceState({ page: 'profiles' }, '');
        window.addEventListener('popstate', handlePopState);
        
        if (appDB.isFirstRun) {
            // اگر اولین بار است، صفحه انتخاب پروفایل رو نشون بده و مودال رو باز کن
            showProfileSelect();
            showAddProfileModal(true); // true یعنی حالت اجباری (بار اول)
        } else {
            showProfileSelect(); 
        }
    } catch (e) {
        console.error('initApp failed:', e);
        alert('خطا در بارگذاری اپ. لطفاً صفحه رو رفرش کن.');
    }
}

initApp();

initApp();