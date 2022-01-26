const fs = require('fs');

fs.readFile("./data/carsTypes.csv", "utf8", (err, data) => {
    let res = [];
    if (err)
        return res;
    for (const d of data.split('\n').map(x => x.trim().split(';'))) {
        const t = res.find(x => x.brand === d[0]);
        if (!t) {
            res.push({
                brand: d[0],
                child: [{
                    model: d[1],
                    child: [{ type: d[2], size: d[3] }]
                }]
            });
        } else {
            const r = t.child.find(x => x.model === d[1]);
            if (!r) {
                t.child.push({
                    model: d[1],
                    child: [{ type: d[2], size: d[3] }]
                })
            }
            else {
                r.child.push({ type: d[2], size: d[3] })
            }
        }
    }

    fs.writeFileSync("./data/carsTypes.json", JSON.stringify(res));
    return res;
});
