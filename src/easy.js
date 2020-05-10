(win => {
  let hasOwn = {}.hasOwnProperty,
    _instanceOf = _constructor => {
      return function(o) {
        return o instanceof _constructor;
      };
    },
    isEmptyObject = function(obj) {
      for (var name in obj) {
        return false;
      }
      return true;
    };
  class DOM {
    constructor() {
      return this;
    }
    createDom(args) {
      let dom = null;
      for (let i = 0; i < args.length; i++) {
        switch (i) {
          case 0:
            if (args[0] === "text") {
              dom = document.createTextNode(args[1].text || "");
            } else {
              dom = document.createElement(args[0]);
            }
            break;
          case 1:
            args[0] !== "text" && this.createAttrs(dom, args[1]);
            break;
          default:
            //if (dom.children[dom.children.length - 1] === args[i]) {
            dom.appendChild(args[i]);
            //} else {
            //dom.insertBefore(args[i], dom.children[dom.children.length - 1]);
            //}
            break;
        }
      }
      return dom;
    }
    createAttrs(dom, attrs) {
      for (let n in attrs) {
        if (dom) {
          if (n === "text") {
            if (dom.nodeType === 3) {
              dom.innerHTML = attrs[n];
            } else {
              let text = document.createTextNode(attrs[n]);
              dom.appendChild(text);
            }
          } else if (n === "html") {
            dom.innerHTML = attrs[n];
          } else {
            try {
              dom.setAttribute(n, attrs[n]);
            } catch (e) {
              dom.setAttribute(n.replace("@", "v-on:"), attrs[n]);
            }
          }
        }
      }
      return this;
    }
  }

  class mod {
    constructor() {
      this.sets = {};
      this.amd = {};

      return this;
    }
    defaultFontSize(num) {
      if (!num) {
        document.getElementsByTagName("html")[0].style.fontSize = "";
        return;
      }
      // eslint-disable-next-line no-redeclare
      num = num || 16;
      let iWidth = (document.documentElement || document.body).clientWidth,
        iHeight = (document.documentElement || document.body).clientHeight,
        fontSize =
          (window.orientation &&
            (window.orientation === 90 || window.orientation === -90)) ||
          iHeight < iWidth
            ? iHeight / num
            : iWidth / num;
      window.baseFontSize = fontSize;
      document.getElementsByTagName("html")[0].style.fontSize =
        fontSize.toFixed(2) + "px";
      return fontSize;
    }
    isFunction(obj) {
      return typeof obj === "function" && typeof obj.nodeType !== "number";
    }
    isEmptyObject(obj) {
      return isEmptyObject(obj);
    }
    isPromise(obj) {
      return (
        typeof obj === "object" &&
        obj.then &&
        this.isFunction(obj.then) &&
        obj instanceof Promise
      );
    }
    createObject(obj, name, value, callback) {
      (typeof Reflect !== "undefined" && Reflect.defineProperty
        ? Reflect.defineProperty
        : Object.defineProperty)(obj, name, {
        get() {
          return value;
        },
        set(newValue) {
          if (value === newValue) return;
          var oldValue = value;
          value = newValue;
          callback && callback(newValue, oldValue);
        }
      });
      return this;
    }
    isPlainObject(obj) {
      var key;
      if (!obj || typeof obj !== "object" || obj.nodeType) {
        return false;
      }
      try {
        if (
          obj.constructor &&
          !hasOwn.call(obj, "constructor") &&
          !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")
        ) {
          return false;
        }
      } catch (e) {
        return false;
      }
      for (key in obj) {
        break;
      }
      return key === undefined || hasOwn.call(obj, key);
    }
    extend(a, b) {
      a = a || {};
      for (let i in b) {
        if (a[i] && this.isPlainObject(a[i])) {
          this.extend(a[i], b[i]);
        } else {
          a[i] = b[i];
        }
      }
      return a;
    }
    isArray(obj) {
      return (
        (Array.isArray || _instanceOf(Array))(obj) && typeof obj !== "string"
      );
    }
    each(a, b, c) {
      var d,
        e = 0,
        g = this.isArray(a),
        f = (a && a.length) || 0;
      if (c) {
        if (g) {
          for (; f > e; e++) if (((d = b.apply(a[e], c)), d === !1)) break;
        } else {
          for (let e in a) if (((d = b.apply(a[e], c)), d === !1)) break;
        }
      } else if (g) {
        for (; f > e; e++) if (((d = b.call(a[e], e, a[e])), d === !1)) break;
      } else
        for (let e in a) if (((d = b.call(a[e], e, a[e])), d === !1)) break;
      return a;
    }
  }

  class Use {
    constructor() {
      this.callback = next => {
        next();
      };
      return this;
    }
    get(item, that, resolve, reject) {
      let url = "";
      if (that.sets && that.sets.alias[item]) {
        if (/^http[s]/.test(that.sets.alias[item])) {
          url = that.sets.alias[item];
        } else if (/\.vue/.test(that.sets.alias[item])) {
          return new Ajax().get(
            item,
            that.sets.base + that.sets.alias[item],
            that,
            resolve,
            reject
          );
        } else {
          url = that.sets.base + that.sets.alias[item];
        }
      } else if (/^http[s]/.test(item)) {
        url = item;
      } else {
        that.amd[item] && (that.amd[item].status = "error");
        reject("[" + item + "] Illegal document addresses.");
        return;
      }
      if (url !== "") {
        let head = document.getElementsByTagName("head")[0],
          fileType = /\.css/.test(that.sets.alias[item])
            ? "css"
            : /png|gif|jpg/.test(that.sets.alias[item])
            ? "img"
            : "js",
          script = document.createElement(
            fileType === "js" ? "script" : fileType === "css" ? "link" : "img"
          );
        script[fileType === "css" ? "href" : "src"] =
          url + "?t=" + (Math.random(1000) + "").replace(/\./gim, "");
        if (fileType === "css") {
          script.rel = "stylesheet";
        }
        head.appendChild(script);
        script.onload = () => {
          that.amd[item].status = "loaded";
          this.callback(() => {
            resolve(that.amd);
          });
        };
        script.onerror = err => {
          that.amd[item].status = "error";
          this.callback(() => {
            reject(err);
          });
        };
      } else {
        that.amd[item] && (that.amd[item].status = "error");
        reject("[" + item + "] Illegal document addresses.");
      }
      return this;
    }
  }

  class Ajax {
    constructor() {
      this.callback = next => {
        next();
      };
      return this;
    }
    get(name, url, that, resolve, reject) {
      let self = this;
      easy
        .set({
          alias: {
            axios: "https://unpkg.com/axios/dist/axios.min.js",
            less:
              "https://cdnjs.cloudflare.com/ajax/libs/less.js/3.11.1/less.min.js"
          }
        })
        .use("less axios", () => {
          that.amd["axios"].exports = {
            axios: window.axios
          };
          that.amd["axios"].status = "loaded";
          window.axios
            .get(url)
            .then(res => {
              if (/\.vue/.test(url)) {
                let a = document.createElement("base");
                a.innerHTML = res.data;
                let template = a.children[0].innerHTML,
                  js = a.children[1].innerHTML,
                  style = a.children[2].innerHTML;
                let obj =
                  js
                    .replace(/(export\s+default\s+{)/gim, (a, b) => {
                      a = a.replace(
                        b,
                        'Vue.component("' +
                          name +
                          '", {template:"' +
                          template
                            .replace(/"/gim, '\\"')
                            .replace(/'/gim, "\\'")
                            .replace(/\r|\n/gim, "")
                            .replace(/\s{2,}/gim, " ") +
                          '",'
                      );
                      return a;
                    })
                    .replace(/;$/gim, "") + ")";
                obj =
                  "return new Promise((resolve, reject) => { resolve(" +
                  obj +
                  ");});";
                obj = new Function(obj)();
                that.amd[name].exports = {
                  component: obj,
                  getStyle: function() {
                    /* easy
                      .set({
                        alias: {
                          less:
                            "https://cdnjs.cloudflare.com/ajax/libs/less.js/3.11.1/less.min.js"
                        }
                      })
                      .use("less", () => { */
                    if (window.less) {
                      that.amd["less"].exports = {
                        less: window.less
                      };
                      that.amd["less"].status = "loaded";
                      let head = document.getElementsByTagName("head")[0];
                      let styles = document.createElement("style");
                      styles.id = name;
                      head.appendChild(styles);
                      window.less.render(style, {}, function(error, output) {
                        if (error) {
                          console.log(error);
                          return;
                        }
                        styles.innerHTML = output.css;
                      });
                    }
                    //});
                  }
                };
              } else if (/\.less/.test(url)) {
                let style = res.data;
                that.amd[name].exports = {
                  component: null,
                  getStyle: function() {
                    /*  easy
                      .set({
                        alias: {
                          less:
                            "https://cdnjs.cloudflare.com/ajax/libs/less.js/3.11.1/less.min.js"
                        }
                      })
                      .use("less", () => { */
                    if (window.less) {
                      that.amd["less"].exports = {
                        less: window.less
                      };
                      that.amd["less"].status = "loaded";
                      let head = document.getElementsByTagName("head")[0];
                      let styles = document.createElement("style");
                      styles.id = name;
                      head.appendChild(styles);
                      window.less.render(style, {}, function(error, output) {
                        if (error) {
                          console.log(error);
                          return;
                        }
                        styles.innerHTML = output.css;
                      });
                    }
                    //});
                  }
                };
              }
              that.amd[name].status = "loaded";
              self.callback(() => {
                resolve(that.amd);
              });
            })
            .catch(err => {
              that.amd[name].status = "error";
              self.callback(() => {
                reject(err);
              });
            });
          //console.log(url, resolve, reject);
        });
      return this;
    }
  }

  class Device {
    constructor() {
      let ua = navigator.userAgent.toLowerCase(),
        device = {
          os: {
            version: 0,
            isIOS:
              ua.indexOf("iphone") > -1 ||
              ua.indexOf("ipad") > -1 ||
              ua.indexOf("ios") > -1,
            isAndroid:
              ua.indexOf("android") > -1 ||
              ua.indexOf("adr") > -1 ||
              ua.indexOf("linux;") > -1
          },
          browser: {
            version: 0,
            isQQ: ua.indexOf("qq/") > -1,
            isqqbrowser: ua.indexOf("mqqbrowser/") > -1,
            isUC: ua.indexOf("ucbrowser/") > -1 || ua.indexOf("ucweb/") > -1,
            isWechat: ua.indexOf("micromessenger/") > -1,
            isSamsung: ua.indexOf("samsungbrowser/") > -1,
            isSogou: ua.indexOf("sogoumobilebrowser/") > -1,
            isPinganWifi: ua.indexOf("pawifi") > -1,
            isChrome: ua.indexOf("chrome") > -1,
            isOpera: ua.indexOf("opera") > -1 || ua.indexOf("opr") > -1,
            isFirefox: ua.indexOf("firefox") > -1 || ua.indexOf("fxios") > -1,
            isBaiduboxapp: ua.indexOf("baiduboxapp/") > -1,
            isBaidubrowser: ua.indexOf("baidubrowser/") > -1,
            isQihoobrowser: ua.indexOf("qihoobrowser/") > -1,
            isMxios: ua.indexOf("mxios/") > -1,
            isTimMobile: ua.indexOf("tim/") > -1,
            isHXApp:
              ua.indexOf("hxappversion") > -1 || ua.indexOf("hxapp") > -1,
            isWeiBo: ua.indexOf("weibo") > -1,
            isMiuiBrowser: ua.indexOf("miuibrowser/") > -1
          },
          model: {
            isIphoneX:
              /iphone[\s\S]*os x/.test(ua) &&
              screen.height === 812 &&
              screen.width == 375,
            isHUAWEI: /huawei/.test(ua),
            isOPPO: /oppo/.test(ua),
            isMEIZU: /meizu/.test(ua),
            isXIAOMI:
              /xiaomi/.test(ua) || /miuibrowser\//.test(ua) || /mi/.test(ua),
            isVIVO: /vivo/.test(ua),
            isREDMI: /redmi/.test(ua),
            isHONORBLN: /honorbln/.test(ua),
            isSAMSUNG: /sm-/.test(ua) || /samsung/.test(ua),
            isLE: /Le\s+/.test(ua),
            isONEPLUS: /oneplus/.test(ua),
            isDOOV: /doov/.test(ua),
            isNBY: /nx[0-9]+/.test(ua),
            isLG: /lg-/.test(ua),
            isOD: /od[0-9]+/.test(ua),
            isANE: /ane-/.test(ua),
            isZUK: /zuk\s+/.test(ua),
            isLenovo: /lenovo/.test(ua)
          }
        };
      device.browser.isSafari =
        device.os.isIOS &&
        ua.indexOf("safari/") > -1 &&
        !device.browser.isqqbrowser;

      return device;
    }
  }

  let docElement = document.documentElement,
    prefixes = " -webkit- -moz- -o- -ms- ".split(" "),
    is = function(obj, type) {
      return typeof obj === type;
    },
    isEventSupported = (function() {
      var TAGNAMES = {
        select: "input",
        change: "input",
        submit: "form",
        reset: "form",
        error: "img",
        load: "img",
        abort: "img"
      };

      function isEventSupported(eventName, element) {
        element =
          element || document.createElement(TAGNAMES[eventName] || "div");
        eventName = "on" + eventName;

        var isSupported = eventName in element;

        if (!isSupported) {
          if (!element.setAttribute) {
            element = document.createElement("div");
          }
          if (element.setAttribute && element.removeAttribute) {
            element.setAttribute(eventName, "");
            isSupported = is(element[eventName], "function");

            if (!is(element[eventName], "undefined")) {
              element[eventName] = undefined;
            }
            element.removeAttribute(eventName);
          }
        }

        element = null;
        return isSupported;
      }
      return isEventSupported;
    })(),
    injectElementWithStyles = function(rule, callback, nodes, testnames) {
      var style,
        ret,
        node,
        docOverflow,
        div = document.createElement("div"),
        body = document.body,
        fakeBody = body || document.createElement("body");

      if (parseInt(nodes, 10)) {
        while (nodes--) {
          node = document.createElement("div");
          node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
          div.appendChild(node);
        }
      }

      style = ["&#173;", '<style id="s', mod, '">', rule, "</style>"].join("");
      div.id = mod;
      (body ? div : fakeBody).innerHTML += style;
      fakeBody.appendChild(div);
      if (!body) {
        fakeBody.style.background = "";
        fakeBody.style.overflow = "hidden";
        docOverflow = docElement.style.overflow;
        docElement.style.overflow = "hidden";
        docElement.appendChild(fakeBody);
      }

      ret = callback(div, rule);
      if (!body) {
        fakeBody.parentNode.removeChild(fakeBody);
        docElement.style.overflow = docOverflow;
      } else {
        div.parentNode.removeChild(div);
      }

      return !!ret;
    };
  class Tests {
    constructor() {
      return this;
    }
    testsCanvas() {
      var elem = document.createElement("canvas");
      return !!(elem.getContext && elem.getContext("2d"));
    }
    testsTouch() {
      var bool;
      if (
        "ontouchstart" in window ||
        (window.DocumentTouch && document instanceof window.DocumentTouch)
      ) {
        bool = true;
      } else {
        injectElementWithStyles(
          [
            "@media (",
            prefixes.join("touch-enabled),("),
            mod,
            ")",
            "{#modernizr{top:9px;position:absolute}}"
          ].join(""),
          function(node) {
            bool = node.offsetTop === 9;
          }
        );
      }
      return bool;
    }
    testsGeolocation() {
      return "geolocation" in navigator;
    }
    testsPostmessage() {
      return !!window.postMessage;
    }
    testsHashchange() {
      return (
        isEventSupported("hashchange", window) &&
        (document.documentMode === undefined || document.documentMode > 7)
      );
    }
    testsHistory() {
      return !!(window.history && history.pushState);
    }
    testsWebsockets() {
      return "WebSocket" in window || "MozWebSocket" in window;
    }
    testsVideo() {
      var elem = document.createElement("video"),
        bool = false;
      try {
        if ((bool = !!elem.canPlayType)) {
          bool = new Boolean(bool);
          bool.ogg = elem
            .canPlayType('video/ogg; codecs="theora"')
            .replace(/^no$/, "");

          bool.h264 = elem
            .canPlayType('video/mp4; codecs="avc1.42E01E"')
            .replace(/^no$/, "");

          bool.webm = elem
            .canPlayType('video/webm; codecs="vp8, vorbis"')
            .replace(/^no$/, "");
        }
      } catch (e) {
        console.log(e);
      }
      return bool;
    }
    testsAudio() {
      var elem = document.createElement("audio"),
        bool = false;
      try {
        if ((bool = !!elem.canPlayType)) {
          bool = new Boolean(bool);
          bool.ogg = elem
            .canPlayType('audio/ogg; codecs="vorbis"')
            .replace(/^no$/, "");
          bool.mp3 = elem.canPlayType("audio/mpeg;").replace(/^no$/, "");

          bool.wav = elem
            .canPlayType('audio/wav; codecs="1"')
            .replace(/^no$/, "");
          bool.m4a = (
            elem.canPlayType("audio/x-m4a;") || elem.canPlayType("audio/aac;")
          ).replace(/^no$/, "");
        }
      } catch (e) {
        console.log(e);
      }
      return bool;
    }
    testsLocalstorage() {
      try {
        localStorage.setItem(mod, mod);
        localStorage.removeItem(mod);
        return true;
      } catch (e) {
        return false;
      }
    }
    testsSessionstorage() {
      try {
        sessionStorage.setItem(mod, mod);
        sessionStorage.removeItem(mod);
        return true;
      } catch (e) {
        return false;
      }
    }
    testsApplicationamd() {
      return !!window.applicationamd;
    }
  }

  class Easy extends mod {
    constructor() {
      super();
      this.DOM = {};
      return this;
    }
    set(v) {
      this.extend(this.sets, v);
      return this;
    }
    use(depend, callback) {
      const that = this;
      if (typeof depend === "string") {
        depend = depend.split(" ");
      }
      new Promise((resolve, reject) => {
        let promises = [];
        for (let i = 0; i < depend.length; i++) {
          let item = depend[i];
          if (that.amd[item]) continue;
          that.amd[item] = {
            name: item,
            status: "init",
            exports: {}
          };
          promises.push(
            new Promise((resolve, reject) => {
              if (
                that.sets &&
                that.sets.alias[item] &&
                /\.vue|\.less/.test(that.sets.alias[item])
              ) {
                let use = new Ajax().get(
                  item,
                  that.sets.base + that.sets.alias[item],
                  that,
                  resolve,
                  reject
                );
                use.callback = next => {
                  next();
                };
              } else {
                let use = new Use().get(item, that, resolve, reject);
                use.callback = next => {
                  next();
                };
              }
            })
          );
        }
        if (promises.length > 0) {
          Promise.all(promises)
            .then(function() {
              resolve.apply(this, arguments);
            })
            .catch(function() {
              reject.apply(this, arguments);
            });
        } else {
          resolve();
        }
      })
        .then(function() {
          callback && callback.call(this);
        })
        .catch(function(err) {
          callback && callback.call(this, err);
        });
      return this;
    }
    device() {
      return new Device();
    }
    test(name) {
      name =
        "tests" +
        name.substr(0, 1).toUpperCase() +
        name.substr(1, name.length - 1);
      return new Tests()[name]();
    }
    createElement() {
      let args = arguments;

      let dom = null;
      dom = new DOM().createDom(args);
      return dom;
    }
  }

  String.prototype._firstUpper = function() {
    return this.substr(0, 1).toUpperCase() + this.substr(1, this.length - 1);
  };
  Array.prototype._argsToArray = function(obj) {
    if (obj) {
      var arr = new Array(obj.length);
      new mod().each(arr, i => {
        arr[i] = obj[i];
      });
      return arr;
    }
    return [];
  };

  let easy = new Easy();
  easy.each(
    "a div p span h1 h2 h3 h4 h5 h6 article aside address ul li header footer ol menu data datalist dd dt dl form input textarea label nav meta link script select option section strong style table tbody th tr td caption tfoot thead title video audio img em button template textnode".split(
      " "
    ),
    (i, name) => {
      !easy.DOM[name] &&
        (easy.DOM[name] = function() {
          var args = arguments;
          args = []._argsToArray(args);
          args.splice(0, 0, name);
          return easy.createElement.apply(easy, args);
        });
    }
  );

  class VueVerify extends mod {
    constructor() {
      super();
      return this;
    }
    set(that, keys) {
      let self = this;
      return {
        then: callback => {
          for (let n in keys) {
            that["set" + n._firstUpper()] = v => {
              that[n] = v;
            };
            that.$watch(n, (nv, ov) => {
              if (self.isFunction(keys[n])) {
                let v = keys[n](nv, ov);
                callback(n, v);
              } else {
                let v = keys[n].exec(nv);
                callback(n, v);
              }
            });
          }
        }
      };
    }
  }
  win.Verify = new VueVerify();

  Promise.prototype.delay = function(time) {
    let that = this;
    return this.then(res => {
      // eslint-disable-next-line no-unused-vars
      return new Promise((resolve, reject) => {
        that.promiseTimeout && clearTimeout(that.promiseTimeout);
        that.promiseTimeout = setTimeout(
          () => {
            resolve(res);
          },
          time ? time * 1000 : 1000
        );
      });
    });
  };

  easy.pollData = (created, data, callback, error, delay) => {
    delay = delay || 5;
    let timeout = null,
      isClose = false;
    let next = (/* url, data */) => {
        return new Promise((resolve, rejects) => {
          created(data, resolve, rejects);
        });
      },
      start = fn => {
        fn(/* url, data */)
          .then(res => {
            callback && callback(res);
            timeout && clearTimeout(timeout);
            !isClose &&
              (timeout = setTimeout(() => {
                start(next);
              }, delay * 1000));
          })
          .catch(err => {
            timeout && clearTimeout(timeout);
            error && error(err);
          });
      };
    start(next);
    return {
      destroyed: () => {
        if (timeout) {
          clearTimeout(timeout);
          isClose = true;
        }
      }
    };
  };

  win.Easy = easy;

  let define = function(dependName, depends, callback) {
    let args = arguments,
      len = args.length;
    if (len === 1) {
      if (easy.isFunction(dependName)) {
        callback = dependName;
        dependName = null;
        depends = null;
      } else if (typeof dependName === "string") {
        callback = null;
        depends = null;
      }
    } else if (len === 2) {
      if (easy.isArray(dependName)) {
        callback = depends;
        depends = dependName;
      } else if (easy.isFunction(depends)) {
        callback = depends;
      }
    } else if (len === 3) {
      if (typeof depends === "string") depends = depends.split(" ");
    }
    let fn = () => {
      callback &&
        callback(
          name => {
            return (
              easy.amd[name] &&
              !isEmptyObject(easy.amd[name].exports) &&
              easy.amd[name].exports
            );
          },
          (dependName &&
            easy.amd[dependName] &&
            easy.amd[dependName].exports) ||
            {},
          (dependName &&
            easy.amd[dependName] &&
            easy.amd[dependName].exports) ||
            {}
        );
    };
    if (easy.isArray(depends)) {
      easy.use(depends, () => {
        fn();
      });
    } else {
      fn();
    }
  };
  win.define = define;
  define(() => {
    let main = document.getElementById("easyroot");
    if (main) {
      let name = main.getAttribute("data-main");
      name && easy.use(name);
    }
  });
})(window);
