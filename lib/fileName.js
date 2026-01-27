const cleanAppName = (str) => {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
};

module.exports = {
  cleanAppName,
};
