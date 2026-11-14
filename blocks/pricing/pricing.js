/*
 * Pricing: each row = one plan.
 * Column 1 = plan name (heading), price, feature list, button.
 * Column 2 (optional) = badge text such as "Most popular"; that plan is highlighted.
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [plan, badge] = row.children;
    row.className = 'pricing-plan';
    if (plan) plan.className = 'pricing-body';
    const text = badge?.textContent.trim();
    if (text) {
      row.classList.add('pricing-featured');
      badge.className = 'pricing-badge';
      row.prepend(badge);
    } else if (badge) {
      badge.remove();
    }
  });
}
