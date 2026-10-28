const hits = new Map(); 

const rateLimiter = ({ windowMs = 15 * 60 * 1000, max = 10 } = {}) => (req, res, next) => {
  const now = Date.now();
  const rec = hits.get(req.ip);
  if (!rec || rec.resetAt < now) {
    hits.set(req.ip, { count: 1, resetAt: now + windowMs });
    return next();
  }
  if (++rec.count > max) {
    res.set('Retry-After', Math.ceil((rec.resetAt - now) / 1000));
    return res.status(429).json({ message: 'Too many attempts, try again later' });
  }
  next();
};

setInterval(() => { 
  const now = Date.now();
  for (const [k, v] of hits) if (v.resetAt < now) hits.delete(k);
}, 10 * 60 * 1000).unref();

module.exports = rateLimiter;