export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const truncateText = (text, length) => {
  if (text.length > length) {
    return text.slice(0, length) + '...';
  }
  return text;
};

export const getInitials = (name) => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  let score = 0;
  const feedback = [];

  if (!password) return { score: 0, strength: 'Weak', isValid: false, feedback: ["Enter a password"] };

  // ===== Basic rules =====
  // Length check (Mandatory, but no points added)
  if (password.length < 12) feedback.push("Use at least 12 characters");

  if (/[a-z]/.test(password)) score += 15;
  else feedback.push("Add lowercase letters");

  if (/[A-Z]/.test(password)) score += 15;
  else feedback.push("Add uppercase letters");

  if (/\d/.test(password)) score += 15;
  else feedback.push("Add numbers");

  if (/[^\w\s]/.test(password)) score += 20;
  else feedback.push("Add special characters");

  // ===== Block repeated characters (aaa, 111) =====
  if (!/(.)\1\1/.test(password)) score += 10;
  else feedback.push("Avoid repeating characters");

  // ===== Block sequences (abc, 123) =====
  if (!hasSequential(password)) score += 5;
  else feedback.push("Avoid sequences (abc, 123)");

  // ===== Strength label =====
  let strength;
  if (score >= 60) strength = "Strong";
  else if (score >= 30) strength = "Medium";
  else strength = "Weak";

  return {
    score,
    strength,
    isValid: score >= 60 && password.length >= 12,
    feedback
  };
};

// Internal Helper
function hasSequential(str, length = 3) {
  if (!str) return false;
  const sequences = "abcdefghijklmnopqrstuvwxyz0123456789";
  const lower = str.toLowerCase();

  for (let i = 0; i <= sequences.length - length; i++) {
    const seq = sequences.substring(i, i + length);
    const rev = seq.split("").reverse().join("");

    if (lower.includes(seq) || lower.includes(rev)) {
      return true;
    }
  }
  return false;
}

export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
