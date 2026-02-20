/**
 * @file toastManager.js
 * Gestionnaire de notifications toast (affichage temporaire).
 * Dépendances : aucune.
 */

class ToastManager {
    constructor() {
        this.container = document.getElementById('toastContainer');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toastContainer';
            this.container.className = 'toastContainer';
            document.body.appendChild(this.container);
        }

        // --- NEW: Délégation d'événements unique pour tout le conteneur ---
        this.container.addEventListener('click', (e) => {
            const toastEl = e.target.closest('.toast');
            if (toastEl) {
                this.remove(toastEl);
            }
        });

        this.toasts = [];
        this.maxToasts = 5;
    }

    show(options) {
        const {
            title = '',
            message = '',
            type = 'info',
            icon = this.getDefaultIcon(type),
            duration = 3000,
            closable = true
        } = options;

        if (this.toasts.length >= this.maxToasts) {
            this.removeOldest();
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                ${message ? `<div class="toast-message">${message}</div>` : ''}
            </div>
            ${closable ? '<div class="toast-close">×</div>' : ''}
        `;

        this.container.appendChild(toast);
        this.toasts.push(toast);

        this.container.appendChild(toast);
        this.toasts.push(toast);

        if (duration > 0) {
            setTimeout(() => this.remove(toast), duration);
        }

        return toast;
    }

    remove(toast) {
        if (!toast || !toast.parentElement || toast.dataset.removing) return;

        toast.dataset.removing = 'true';
        toast.classList.add('removing');

        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
            this.toasts = this.toasts.filter(t => t !== toast);
        }, 300);
    }

    removeOldest() {
        if (this.toasts.length > 0) {
            this.remove(this.toasts[0]);
        }
    }

    removeAll() {
        this.toasts.forEach(toast => this.remove(toast));
    }

    getDefaultIcon(type) {
        const icons = {
            success: '✓',
            info: 'ℹ',
            warning: '⚠',
            error: '✕',
            shiny: '✨',
            legendary: '👑'
        };
        return icons[type] || 'ℹ';
    }

    success(title, message, duration) {
        return this.show({ title, message, type: 'success', duration });
    }

    info(title, message, duration) {
        return this.show({ title, message, type: 'info', duration });
    }

    warning(title, message, duration) {
        return this.show({ title, message, type: 'warning', duration });
    }

    error(title, message, duration) {
        return this.show({ title, message, type: 'error', duration });
    }

    shiny(title, message, duration = 5000) {
        return this.show({ title, message, type: 'shiny', duration });
    }

    legendary(title, message, duration = 5000) {
        return this.show({ title, message, type: 'legendary', duration });
    }
}

const toast = new ToastManager();
window.toast = toast;
