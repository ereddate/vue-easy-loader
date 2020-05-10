# vue-easy-loader

#### 介绍
vue程序化编程按需加载工具，支持本地js脚本、样式、less、图片文件及远程文件加载。
适用于vue项目中动态加载模块、动态路由及相关组件加载、短生命期需求、全编程化开发模块加载等的快速迭代开发使用。

#### 依赖
vue
axios
less

#### 使用

```
<script src="easy.js"></script>
<script src="main.js"></script>
````

```
也可以这么写，直接调用主文件main.js
<script src="easy.js" data-main="main.js" id="easyroot"></script>
```


```
main.js
define(require => {
    Easy.set({
        base:"./",
        alias:{
            test:"js/xxx/test.js",
            vueComponent:"vue/xxx/vueComponent.vue"
        }
    }).use("test vueComponent", (v) => {
        Promise.all([
            require("test").component,
            require("vueComponent").component
        ]).then(v => {
            console.log(v[0]);
            v[1].getStyle();  //vue文件中的less内容转成CSS并插入到head标签的style标签中
            console.log(v[1]);
        })
    });
});
```

```
test.js
define("test", (require, exports, module) => {
    exports.component = new Promise((resolve, reject) => {
        resolve(Vue.component("test", {
            render(createElement){
                return createElement("div", {class:"test"})
            },
            data(){
                return{};
            }
        }));
    }）
})
```

Easy提供了一些其他相关的功能，可以使用。

```
1）类似VUE的createElement方法，Easy.createElemnt("div", {}, Easy.createElemnt("a", {}) ...)或Easy.DOM.div({}, ...)
2）使用rem时html标签基础字体的控制，Easy.defaultFontSize(16)
3）对html5 api的验证，Easy.test("video")
4）移动设备、浏览器、系统识别，Easy.device().os.isIOS 或 Easy.device().browser.isChrome 或 Easy.device().model.isHUAWEI
5）表单验证或其他验证，Verify.set({}).then(v=>{})
6）数据轮询，Easy.pollData((data, resolve, reject) => {resolve(data)}, data, callback, error, delay)
7）promise增加delay延时执行，new Promise((resolve, reject)=>{resolve({a:1})}).delay(5).then(v=>{}).catch(err=>{})

```

```
Verify的使用
render(createElement){
    return createElement("input", {
        domProps: {
          value: self.password
        },
        on: {
          input: function(e) {
            self.setPassword(e.target.value);
          }
        }
    })
}

data(){
    return {
        password:""
    }
}

mounted(){
    Verify.set(this, {
        password: function(v) {
          return /^[A-Z]+[a-zA-Z0-9]+/.test(v) && v.length === 8;
        }
    }).then((n, v) => {
        console.log(n, v);
    });
}
```

```
Easy.pollData使用
let num = 0;
let pollData = Easy.pollData(
    function(data, resolve, reject) {
      resolve(data);
    },
    {},
    function(v) {
      console.log(v);
      if (num + 1 >= 5) {
        pollData.destroyed();  //注销
        return;
      }
      num += 1;
    },
    function(err) {
      console.log(err);
    },
    1
);
```

