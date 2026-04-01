const multer = require('multer'); //

// Configure storage
const storage = multer.diskStorage({ //
  destination: (req, file, cb) => { //
    cb(null, 'uploads/'); //
  },
  filename: (req, file, cb) => { //
    cb(null, `${Date.now()}-${file.originalname}`); //
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allow images and documents (for resumes)
  const allowedTypes = [
    'image/jpeg', 
    'image/png', 
    'image/jpg', 
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  ];
  
  // Check file extension as well (some browsers may not set correct mimetype)
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
  const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
  
  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpeg, .jpg, .png, .pdf, .doc, and .docx formats are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter }); //

module.exports = upload; //