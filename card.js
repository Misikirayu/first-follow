const Card = {
  init() {
    this.cards = document.querySelectorAll(".result-card");
    this.setupAnimations();
  },

  setupAnimations() {
    this.cards.forEach((card) => {
      // Initial state
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";
      card.style.transition = "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)";

      // Animate in on load
      setTimeout(() => {
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }, 100);

      // Hover animations
      card.addEventListener("mouseenter", () => {
        card.style.transform = "translateY(-8px) scale(1.02)";
        card.style.boxShadow =
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "translateY(0) scale(1)";
        card.style.boxShadow =
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
      });
    });
  },

  animateResults() {
    const results = document.querySelectorAll(".result-item");
    results.forEach((result, index) => {
      result.style.opacity = "0";
      result.style.transform = "translateX(-20px)";
      result.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

      setTimeout(() => {
        result.style.opacity = "1";
        result.style.transform = "translateX(0)";
      }, index * 100); // Stagger the animations
    });
  },
};

// Initialize the card animations
document.addEventListener("DOMContentLoaded", () => {
  Card.init();
});
