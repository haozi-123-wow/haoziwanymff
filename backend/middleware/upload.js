const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|ico|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件 (jpeg, jpg, png, gif, webp, ico, svg)'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024
  },
  fileFilter: fileFilter
});

const uploadFields = upload.fields([
  { name: 'siteLogo', maxCount: 1 },
  { name: 'siteFavicon', maxCount: 1 },
  { name: 'loginLogo', maxCount: 1 }
]);

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        code: 400,
        message: '文件大小超过限制，最大允许2MB',
        timestamp: Date.now()
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        code: 400,
        message: '文件数量超过限制',
        timestamp: Date.now()
      });
    }
    return res.status(400).json({
      code: 400,
      message: '文件上传错误: ' + err.message,
      timestamp: Date.now()
    });
  } else if (err) {
    return res.status(400).json({
      code: 400,
      message: err.message,
      timestamp: Date.now()
    });
  }
  next();
};

const getUploadedFiles = (req) => {
  const files = {};
  
  if (req.files) {
    if (req.files.siteLogo && req.files.siteLogo.length > 0) {
      files.siteLogo = '/uploads/' + req.files.siteLogo[0].filename;
    }
    if (req.files.siteFavicon && req.files.siteFavicon.length > 0) {
      files.siteFavicon = '/uploads/' + req.files.siteFavicon[0].filename;
    }
    if (req.files.loginLogo && req.files.loginLogo.length > 0) {
      files.loginLogo = '/uploads/' + req.files.loginLogo[0].filename;
    }
  }
  
  return files;
};

module.exports = {
  uploadFields,
  handleUploadError,
  getUploadedFiles
};
