function memoryPercent(days, strength) {
  return Math.round(100 * Math.exp(-days / strength));
}

function nextRevision(strength) {
  const d = new Date();
  d.setDate(d.getDate() + strength * 2);
  return d;
}

module.exports = { memoryPercent, nextRevision };
