
const forPengguna = (req, res, next) => {
  if (!req.user || req.user.peran !== 'pengguna') {
    return res.status(403).json({ message: 'Akses hanya untuk pengguna' });
  }
  next();
};

const forPeninjau = (req, res, next) => {
  if (!req.user || req.user.peran !== 'peninjau') {
    return res.status(403).json({ message: 'Akses hanya untuk peninjau' });
  }
  next();
};

const forPenggunaDanPeninjau = (req, res, next) => {
  if (!req.user || (req.user.peran !== 'pengguna' && req.user.peran !== 'peninjau')) {
    return res.status(403).json({ message: 'Akses hanya untuk pengguna atau peninjau' });
  }
  next();
};

module.exports = {
  forPengguna,
  forPeninjau,
  forPenggunaDanPeninjau
};
