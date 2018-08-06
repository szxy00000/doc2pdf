const isProduction = process.env.NODE_ENV === "production";

import Router from "koa-better-router";
import fs from "fs";
import md5 from "md5";
import multer from "koa-multer";
import { exec } from "child_process";
import pdfToPng from "../pdfToPng";
import docToPdf from "../docToPdf";
import {
    successResponse,
    paramsErrorResponse,
    errorResponse,
    supportFileType,
    getUploadPath,
    mergeChunks
} from "../utils";
// 其他工具用户的接口权限
const router = Router().loadMethods();

const uploadFileToServices = function() {
    let storage = multer.diskStorage({
        destination: function(req, file, cb) {
            let isChunk = req.body.isChunk;
            
            if (isChunk) {
                cb(null, `./uploads-chunk/`);
            } else {
                // cb(null, "./uploads/");
                if (
                    supportFileType(file.originalname) === 'img'
                ) {
                    cb(null, "./uploads/");
                } else if (
                    supportFileType(file.originalname) === 'doc'
                ) {
                    cb(null, "./uploads-other/");
                }
            }
        },
        filename: function(req, file, cb) {
            let name = req.headers["content-length"] + file.originalname;
            let { isChunk, chunkIndex } = req.body;

            if (isChunk) {
                name = name + "-" + chunkIndex;
            }
            cb(null, name);
        }
    });
    let upload = multer({
        storage: storage
    });
    return upload.single("filecontent");
};

router.get("/checkFileExist", async (ctx, next) => {
    ctx.body = fs.existsSync(ctx.querystring, { cwd: "./zips" });
});

router.get("/download/:filename", async (ctx, next) => {
    ctx.body = fs.createReadStream(
        "./zips/" + decodeURIComponent(ctx.params.filename)
    );
});

router.post("/upload", uploadFileToServices(), async (ctx, next) => {
    let file = ctx.req.file;
    let {
        isChunk,
        chunkIndex,
        chunksLength,
        userName,
        returnType
    } = ctx.req.body;
    
    if (
        supportFileType(file.filename) === returnType ||
        !supportFileType(file.filename) ||
        !returnType
    ) {
        paramsErrorResponse(ctx, "参数错误!");
        return;
    }

    // 参数合法检查
    if (file) {
        let fileName = file.filename;
        let uploadPath = getUploadPath(file.filename);
        // 上传方式判断：分片or不分片
        if (!isChunk || (isChunk && chunksLength - 1 == chunkIndex)) {
            // chunk文件合并 ---- start
            if (isChunk && chunksLength - 1 == chunkIndex) {
                let chunkFileName = fileName.split("-")[0];
                let sourceArr = [];

                // 获取要合并的文件的路径
                for (let i = 0; i < chunksLength; i++) {
                    sourceArr.push(`./uploads-chunk/${chunkFileName}-${i}`);
                }

                let chunkResult = await mergeChunks(
                    fileName,
                    sourceArr,
                    `${uploadPath}${fileName}`
                );

                if (!chunkResult) {
                    errorResponse(ctx, "文件合并上传失败");
                }

                // 合并文件
            }

            // chunk文件合并 -----> end

            if (supportFileType(file.filename) === "doc") {
                docToPdf(fileName, async () => {
                    returnType === "png" &&
                        (await pdfToPng(
                            fileName.replace(/\.\w+$/, ".pdf"),
                            userName,
                            "pdf"
                        ));
                    returnType === "pdf" &&
                        (exec(`zip -r ${fileName.replace(/\.\w+$/, ".zip")} ${fileName.replace(/\.\w+$/, ".pdf")}`, { cwd: './uploads' }));
                });
            }
            supportFileType(file.filename) === "pdf" &&
                (await pdfToPng(fileName, userName, "pdf"));

            if (supportFileType(file.filename) === "img") {
                exec(
                    `cp ./uploads/${fileName} ./uploads/${fileName}-0.created.png`,
                    error => {
                        pdfToPng(fileName, userName, "png");
                    }
                );
            }
            ctx.body =
                "http://" +
                ctx.headers.host +
                "/download/" +
                encodeURIComponent(fileName.replace(/\.\w+$/, ".zip"));
        } else {
            return new Promise((resolve, reject) => {
                fs.stat(`./uploads-chunk/${fileName}`, (error, stat) => {
                    if (stat.size === file.size) {
                        successResponse(
                            ctx,
                            null,
                            `文件分片${Number(chunkIndex) +
                                1}/${chunksLength}上传成功`
                        );
                    } else {
                        errorResponse(ctx, "文件丢失, 正在重新尝试上传");
                    }
                    resolve();
                });
            });
        }
    } else {
        paramsErrorResponse(ctx, "检查不到文件或参数有误！");
    }
});

export default router;
