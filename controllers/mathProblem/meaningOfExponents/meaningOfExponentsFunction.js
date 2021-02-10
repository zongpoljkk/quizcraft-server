const multiplicationTerm = async (a, n) => {
  let out = "";
  n = Math.abs(n);
  for (i=0; i<n; i++) {
    if (i==0) {
      out += a<0? `(${a})` : `${a}`;
    } else {
      out += a<0? `*(${a})` : `*${a}`;
    }
  }
  return out;
}

module.exports = { multiplicationTerm };