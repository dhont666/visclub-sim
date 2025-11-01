// Update notification badges in admin panel
function updateBadges() {
    // Update contact messages badge
    const contactMessages = JSON.parse(localStorage.getItem('contact_messages') || '[]');
    const unreadContact = contactMessages.filter(m => m.status === 'unread').length;
    const contactBadge = document.getElementById('unreadContactBadge');
    if (contactBadge) {
        contactBadge.textContent = unreadContact;
        contactBadge.style.display = unreadContact > 0 ? 'inline-block' : 'none';
    }

    // Update permit applications badge
    const permitApplications = JSON.parse(localStorage.getItem('permit_applications') || '[]');
    const pendingPermits = permitApplications.filter(a => a.status === 'pending').length;
    const permitBadge = document.getElementById('pendingPermitsBadge');
    if (permitBadge) {
        permitBadge.textContent = pendingPermits;
        permitBadge.style.display = pendingPermits > 0 ? 'inline-block' : 'none';
    }
}

// Update badges on page load
document.addEventListener('DOMContentLoaded', updateBadges);

// Update badges every 30 seconds
setInterval(updateBadges, 30000);
