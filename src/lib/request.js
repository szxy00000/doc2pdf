require('babel-core/register');
// fetch封装
import fetch from 'isomorphic-fetch';

const getOption = {};
const postOption = { 
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
};

let errorInfo = {
    errorno: -101,
    errmsg: "服务器内部请求出错",
    data: null,
}

const checkStatus = (response) => {

  let {status, statusText} = response;

  if (response.ok) {
    return response;
  }
  // 进行统一错误处理
  // 再抛出，用来停止查询
  let error = new Error();
    error = {
    status,
    msg: statusText
  }
  throw error;

};

const toJson = res => res.json();

// 封装fetch的get
const getData = (url, moreOption = {}) => {
  return fetch(url, {
            ...getOption,
            ...moreOption
          })
          .then(checkStatus)
          .then(toJson)
          .catch(err => {
            // 内部错误拦截，对外统一

            console.log(err)
            return errorInfo;
          });
};
          
// 封装fetch的get
const postData = (url, data,  moreOption = {}) => {
  return fetch(url, {
            ...postOption,
            ...moreOption,
            body: data,
          })
          .then(checkStatus)
          .then(toJson)
          .catch(err => {
            // 内部错误拦截，对外统一
 
            console.log(err)
            return errorInfo;
          });

};

export {
  getData,
  postData,
};