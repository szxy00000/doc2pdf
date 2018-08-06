import pdfjsLib from "pdfjs-dist";
import fs from "fs";
import { exec, execSync } from "child_process";
import { TaskQueue } from "./utils";

export default function(fileName, userName, type) {
    let markQueue = new TaskQueue();
    const waterMark = (creatingName, waterName, targetName, doZip) => {
        if (fs.existsSync(`./uploads/${targetName}.png`)) {
            markQueue.next();
            doZip && doZip();
            return;
        }
        exec(
            `/usr/bin/convert -size  240x280 xc:none -fill "rgba(0,0,0,0.15)" -pointsize 30  -gravity center -annotate 45 ${waterName} miff:- |    /usr/bin/composite -tile - ./uploads/${creatingName}.created.png  ./uploads/${creatingName}.watermarking.png`,
            firstMarkError => {
                exec(
                    `/usr/bin/convert -size  240x280 xc:none -fill "rgba(255,255,255,0.3)" -pointsize 30  -gravity center -annotate 45 ${waterName} miff:- |    /usr/bin/composite -tile - ./uploads/${creatingName}.watermarking.png  ./uploads/${targetName}.watermark.png`,
                    secondMarkError => {
                        exec(
                            `rm -f ./uploads/${creatingName}.watermarking.png && rm -f ./uploads/${creatingName}.created.png && mv ./uploads/${targetName}.watermark.png ./uploads/${targetName}.png`,
                            markEndError => {
                                markQueue.next();
                                doZip && doZip();
                            }
                        );
                    }
                );
            }
        );
    };
    let markFn = (fileName, userName, index, doZip) => {
        let creatingName = `${fileName}-${index}`;
        let targetName = `${fileName}-${userName}-${index}`;

        if (fs.existsSync(`./uploads/${creatingName}.creating.png`)) {
            setTimeout(() => {
                markFn(fileName, userName, index, doZip);
            }, 1000);
            return;
        }

        if (
            fs.existsSync(`./uploads/${creatingName}.created.png`) &&
            userName
        ) {
            waterMark(creatingName, userName, targetName, doZip);
        } else {
            exec(
                `/usr/bin/convert -limit memory 100MB -limit map 200MB   -verbose -fill white -opaque none -density 150  ./uploads/${fileName}"[${index}]" -quality 75 -alpha on -strip ./uploads/${creatingName}.creating.png`,
                (error, stdout, stderr) => {
                    exec(
                        `mv ./uploads/${creatingName}.creating.png ./uploads/${creatingName}.created.png`,
                        error => {
                            if (userName) {
                                waterMark(
                                    creatingName,
                                    userName,
                                    targetName,
                                    doZip
                                );
                            } else {
                                markQueue.next();
                                doZip && doZip();
                            }
                        }
                    );
                }
            );
        }
    };
    let doZip = () => {
        let arr = execSync(`ls | grep ${fileName}-`, { cwd: "./uploads" });
        execSync(
            `zip -r ${fileName.replace(
                /\.\w+$/,
                ".zip"
            )} ${arr.toString().replace(/\n/g, " ")}   && mv ${fileName.replace(
                /\.\w+$/,
                ".zip"
            )} ../zips && rm -rf ${fileName}*`,
            { cwd: "./uploads" }
        );
    };
    // ===> function content ===>
    if (type === "pdf") {
        return new Promise(resolve => {
            pdfjsLib
                .getDocument("./uploads/" + fileName)
                .then(function(doc) {
                    resolve(doc.numPages);
                    for (let i = 0; i < doc.numPages; i++) {
                        markQueue.push({
                            name: `${fileName}-${i}`,
                            run: () => {
                                markFn(
                                    fileName,
                                    userName,
                                    i,
                                    i === doc.numPages - 1 ? doZip : null
                                );
                            }
                        });
                    }
                })
                .catch(error => {
                    console.log(error);
                });
        });
    } else if (type === "png") {
        markQueue.push({
            name: `${fileName}-0`,
            run: () => {
                markFn(fileName, userName, 0, doZip);
            }
        });
        return 1;
    }
}
