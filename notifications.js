class NotificationManager {
  constructor() {
    // Initialize as null and set up elements when needed
    this.notification = null;
    this.messageElement = null;
    this.closeButton = null;
    this.timeout = null;
    this.initialized = false;

    // Bind methods to maintain correct 'this' context
    this.hide = this.hide.bind(this);
    this.handleCloseClick = this.handleCloseClick.bind(this);
  }

  initialize() {
    if (!this.initialized) {
      this.notification = document.getElementById("notification");
      this.messageElement = document.getElementById("notificationMessage");
      this.closeButton = document.getElementById("notificationCloseBtn");

      // Add click event listener to close button
      if (this.closeButton) {
        this.closeButton.addEventListener("click", this.handleCloseClick);
      }

      this.initialized = true;
    }
  }

  handleCloseClick(event) {
    event.preventDefault();
    this.hide();
  }

  show(message, duration = 5000) {
    this.initialize();

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    if (this.messageElement) {
      this.messageElement.textContent = message;
    }

    if (this.notification) {
      // Remove any existing classes
      this.notification.classList.remove("show", "hide");
      // Force a reflow
      void this.notification.offsetWidth;
      // Show the notification
      this.notification.classList.add("show");
      this.notification.classList.remove("opacity-0");
    }

    this.timeout = setTimeout(() => {
      this.hide();
    }, duration);
  }

  hide() {
    if (this.initialized && this.notification) {
      this.notification.classList.add("hide");
      this.notification.classList.remove("show");

      // Add opacity class after animation
      setTimeout(() => {
        this.notification.classList.add("opacity-0");
      }, 500); // Match the slideOut animation duration
    }
  }
}

// Create global instance
const notificationManager = new NotificationManager();
