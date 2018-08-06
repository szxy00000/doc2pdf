import { exec } from "child_process";

export default function(fileName, callback) {
    let isChanging = global.docToPdfQueue.hasIn(fileName);

    !isChanging &&
        global.docToPdfQueue.push({
            name: fileName,
            type: "docToPdf",
            run: () => {
                exec(
                    `/usr/bin/unoconv -f pdf ./uploads-other/${fileName}`,
                    error => {
                        global.docToPdfQueue.next();
                        if (!error) {
                            exec(
                                `mv ./uploads-other/${fileName.replace(/\.\w+$/, '.pdf')} ./uploads/`,
                                () => {
                                    callback();
                                }
                            );
                        }
                    }
                );
            }
        });
}
