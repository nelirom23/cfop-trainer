function pad2(n){ return String(n).padStart(2, "0"); }

const CFOP_DATA = {
  // FIX: F2L images are in /img/f2l/algorithm/##.svg
  F2L: Array.from({length:41}, (_,i)=>{
    const n = i+1;
    const id = `F2L-${pad2(n)}`;
    return {
      id,
      name: id,
      img: `https://cubequest.site/img/f2l/algorithm/${pad2(n)}.svg`,
      url: `https://cubequest.site/en/rubik-cube/f2l/algorithm/f2l-${pad2(n)}/`
    };
  }),

  OLL: Array.from({length:57}, (_,i)=>{
    const n = i+1;
    const id = `OLL-${pad2(n)}`;
    return {
      id,
      name: id,
      img: `https://cubequest.site/img/oll/algorithm/${pad2(n)}.webp`,
      url: `https://cubequest.site/en/rubik-cube/oll/algorithm/oll-${pad2(n)}/`
    };
  }),

  PLL: (function(){
    const names = ["Aa","Ab","E","F","Ga","Gb","Gc","Gd","H","Ja","Jb","Na","Nb","Ra","Rb","T","Ua","Ub","V","Y","Z"];
    return names.map(code => ({
      id: `PLL-${code.toUpperCase()}`,
      name: `PLL ${code}`,
      img: `https://cubequest.site/img/pll/complete/${code}.svg`,
      url: `https://cubequest.site/en/rubik-cube/pll/algorithm/pll-${code.toLowerCase()}/`
    }));
  })()
};
