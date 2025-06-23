const cleanAppName = (str) => {
  str = str
    .replace(/\W/g, '')
    .replace(/\s/g, '-')
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, '');
  return str;
};

exports.cleanAppName = cleanAppName;
