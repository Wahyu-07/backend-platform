
const forPengguna = (req, res, next) => {
  if (!req.user || req.user.peran !== 'pengguna') {
    return res.status(403).json({ message: 'Akses hanya untuk pengguna' });
  }
  next();
};

const forPengelola = (req, res, next) => {
  if (!req.user || req.user.peran !== 'pengelola') {
    return res.status(403).json({ message: 'Akses hanya untuk pengelola' });
  }
  next();
};

const forPenggunaDanPengelola = (req, res, next) => {
  if (!req.user || (req.user.peran !== 'pengguna' && req.user.peran !== 'pengelola')) {
    return res.status(403).json({ message: 'Akses hanya untuk pengguna atau pengelola' });
  }
  next();
};

module.exports = {
  forPengguna,
  forPengelola,
  forPenggunaDanPengelola
};
