
function isDateValid(dateStr: string) {
  return !isNaN(new Date(dateStr).getTime());
}

export default isDateValid