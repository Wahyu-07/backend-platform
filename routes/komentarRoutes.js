const express = require('express');
const router = express.Router();
const komentarController = require('../controllers/komentarController');
const { authenticate } = require('../middleware/authentikasi');
const { forPengguna, forPenggunaDanPeninjau } = require('../middleware/authorisasi');


router.get('/', komentarController.getAllKomentar);
router.get('/:id', komentarController.getKomentarById);
router.post('/', authenticate, forPengguna, komentarController.createKomentar);
router.put('/:id', authenticate, forPengguna, komentarController.updateKomentar);
router.delete('/:id', authenticate, forPenggunaDanPeninjau, komentarController.deleteKomentar);

module.exports = router;