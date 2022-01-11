const path = require('path')
const validateImage = (filename, cb) => {
    var extension = (path.extname(filename)).toLowerCase();
    switch (extension) {
        case '.jpg':
            return cb('.jpg');
        case '.jpeg':
            return cb('.jpeg');
        case  '.png':
            return cb('.png');
        default:
            return cb(false);
    }
}

module.exports = {validateImage}