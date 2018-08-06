import fs from "fs";

/* common response methods
**/

export const paramsErrorResponse = (ctx, errorPara) => {
    ctx.body = {
        code: 400,
        msg: errorPara
    };
};

export const errorResponse = (ctx, err) => {
    ctx.body = {
        code: 406,
        msg: err
    };
};

export const warnResponse = (ctx, code, err, data) => {
    ctx.body = {
        code: code,
        msg: err,
        data
    };
};

export const noAuthErrorResponse = (ctx, err) => {
    ctx.body = {
        code: 405,
        msg: err
    };
};

export const DBErrorResponse = (ctx, err) => {
    ctx.body = {
        code: 403,
        msg: `数据库执行失败${err}`
    };
};

export const successResponse = (ctx, data, msg) => {
    ctx.body = {
        code: 0,
        data,
        msg
    };
};

export const parseRange = (str, size) => {
    if (str.indexOf(",") != -1) {
        return;
    }
    if (str.indexOf("=") != -1) {
        var pos = str.indexOf("=");
        var str = str.substr(6, str.length);
    }
    var range = str.split("-");
    var start = parseInt(range[0], 10);
    var end = parseInt(range[1], 10) || size - 1;

    // Case: -100
    if (isNaN(start)) {
        start = size - end;
        end = size - 1;
        // Case: 100-
    } else if (isNaN(end)) {
        end = size - 1;
    }

    // Invalid
    if (isNaN(start) || isNaN(end) || start > end || end > size) {
        return;
    }
    return {
        start: start,
        end: end
    };
};

export const supportFileType = fileName => {
    let type = fileName.match(/\.\w+/)[0];
    let types = {
        ".pdf": "pdf",
        ".jpg": "img",
        ".png": "img",
        ".bmp": "img",
        ".jpeg": "img",
        ".png": "img",
        ".doc": "doc",
        ".docx": "doc",
        ".xlsx": "doc",
        ".excel": "doc"
    };
    return types[type];
};

export const TaskQueue = () => {
    let arr = [];
    let running = false;
    let run = () => {
        running = true;
        if (!arr.length) {
            running = false;
            return;
        }
        let theTask = arr.shift(0);
        theTask && theTask.run && theTask.run();
    };
    return {
        push: task => {
            arr.push(task);
            !running && run();
        },
        next: () => {
            run();
        },
        taskIndex: taskName => {
            let targetIndex = 0;

            arr.forEach((item, index) => {
                if (item.name === taskName) {
                    targetIndex = index + 1;
                }
            });
            return targetIndex;
        },
        taskLength: () => {
            return arr.length;
        },
        hasIn: name => {
            let target = arr.filter(item => {
                return item.name === name;
            });
            return target.length;
        }
    };
};
export const getUploadPath = fileName => {
    let path = "./uploads/";

    if (/mp4/.test(supportFileType(fileName))) {
        path = "./uploads-mp4/";
    } else if (/doc|excel/.test(supportFileType(fileName))) {
        path = "./uploads-other/";
    }
    return path;
};

export function mergeChunks(fileName, chunks, targetPath) {
    return new Promise((resolve, reject) => {
        let chunkPaths = chunks;
        // 采用Stream方式合并
        let targetStream = fs.createWriteStream(targetPath);
        const readStream = function(chunkArray) {
            let path = chunkArray.shift();
            let originStream = fs.createReadStream(path);
            originStream.pipe(
                targetStream,
                { end: false }
            );
            originStream.on("end", function() {
                // 删除文件
                fs.unlinkSync(path);
                if (chunkArray.length > 0) {
                    readStream(chunkArray);
                } else {
                    resolve(true);
                }
            });
        };
        readStream(chunkPaths);
    });
}
