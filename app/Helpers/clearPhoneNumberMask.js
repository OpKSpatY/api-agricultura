function removeMaskFromPhoneNumber(phoneNumberWithMask) {
  return phoneNumberWithMask.replace(/\D/g, '');
};

module.exports = {
  removeMaskFromPhoneNumber,
};
