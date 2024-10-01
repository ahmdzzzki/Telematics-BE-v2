module.exports = {
  preventSqlInjection: async (req, res, next) => {
    try {
      const regex =
        /(\s*([\0\b\'\"\n\r\t\%\_\\]*\s*(((select\s*.+\s*from\s*.+)|(insert\s*.+\s*into\s*.+)|(update\s*.+\s*set\s*.+)|(delete\s*.+\s*from\s*.+)|(drop\s*.+)|(truncate\s*.+)|(alter\s*.+)|(exec\s*.+)|(\s*(all|any|not|and|between|in|like|or|some|contains|containsall|containskey)\s*.+[\=\>\<=\!\~]+.+)|(let\s+.+[\=]\s*.*)|(begin\s*.*\s*end)|(\s*[\/\*]+\s*.*\s*[\*\/]+)|(\s*(\-\-)\s*.*\s+)|(\s*(contains|containsall|containskey)\s+.*)))(\s*[\;]\s*)*)+)/i;

      for (const key in req.body) {
        const element = req.body[key];
        const match = element.match(regex);
        console.log(element);
        if (match) {
          console.log("SQL INJECTION DETECTED");
          return res.status(500).json({
            message: "SQL injection detected",
            suspected: element,
          });
        }
      }

      for (const key in req.query) {
        const element = req.query[key];
        const match = element.match(regex);
        console.log(element);
        if (match) {
          console.log("SQL INJECTION DETECTED");
          return res.status(500).json({
            message: "SQL injection detected",
            suspected: element,
          });
        }
      }

      for (const key in req.params) {
        const element = req.params[key];
        const match = element.match(regex);
        console.log(element);
        if (match) {
          console.log("SQL INJECTION DETECTED");
          return res.status(500).json({
            message: "SQL injection detected",
            suspected: element,
          });
        }
      }
      next();
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "SQL injection detected",
      });
    }
  },
};
