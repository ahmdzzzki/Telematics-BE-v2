async function checkColumnDoesntExist(existCols, commingCols) {
  const containerCols = [];
  for (let i = 0; i < commingCols.length; i++) {
    if (existCols.indexOf(commingCols[i]) === -1) {
      containerCols.push(commingCols[i]);
    }
  }
  return containerCols;
}

module.exports = checkColumnDoesntExist;
