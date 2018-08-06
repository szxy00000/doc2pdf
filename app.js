import Koa from "koa";
import cors from "kcors";
import logger from "koa-logger";
import convert from "koa-convert";
import path from "path";
import staticServ from "koa-static";
import bodyParser from "koa-bodyparser";
import session from "koa-session";
import router from "./src/router";
import { TaskQueue } from "./src/utils";

const app = new Koa();

global.docToPdfQueue = new TaskQueue();
// for the purpose of key rotation.
app.keys = ["some secret hurr"];

// session默认三小时
const session_config = {
    key: "doc-exchange",
    // 3h
    maxAge: 3 * 3600 * 1000,
    /** (boolean) can overwrite or not (default true) */
    overwrite: true,
    /** (boolean) httpOnly or not (default true) */
    httpOnly: true,
    /** (boolean) signed or not (default true) */
    signed: true,
    /**
     * (boolean)
     * Force a session identifier cookie to be set on every response.
     * The expiration is reset to the original maxAge,
     * resetting the expiration countdown. default is false
     * @type {Boolean}
     */
    rolling: false
};

app.proxy = true;
app.use(session(session_config, app));

// 跨域中间件是generator式的，所以这里从convert转换为async式
app.use(
    convert(
        // 允许跨域 Access-Control-Allow-Origin
        cors({
            // 跨域时，允许想服务器传递cookie
            // Access-Control-Allow-Credentials
            credentials: true
        })
    )
);
app.use(logger());

// 处理post请求获取body(ctx.request.body)
app.use(bodyParser());
app.use(router.middleware());

// koa的静态文件服务
// app.use(staticServ("./zips"));

app.listen(8082, "0.0.0.0", () => {
    console.log(`server started: localhost:8082`);
});
