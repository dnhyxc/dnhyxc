### 项目技术架构选型

#### 前台架构说明

该项目前台主要采用 `Electron22` + `Electron-store` + `Vite` + `Vue3` + `Vue-Router4` + `Typescript` + `Pinia` + `Element-plus` + `Echarts` + `@kangc/v-md-editor` + `Eslint` + `Husky` 等技术框架实现。

`electron-store` 用于本地数据的持久化存储，主要使用在应用设置中的快捷键存储、开机自启配置等应用设置的存储。采用 `Pinia` 对全局状态进行管理。使用 `Echarts` 实现标签云。`@kangc/v-md-editor` 则是用来实现编写文章时支持 mackdown。

[前台项目源码](https://github.com/dnhyxc/dnhyxc)

#### 后台架构说明

该项目后台主要采用 `koa2` 相关生态进行编写，数据库则采用 `MongoDb`。

[后台项目源码](https://github.com/dnhyxc/blog-server-web)

#### 项目部署

服务器采用的是腾讯云 `CentoOS` 服务器，采用 `nginx` 作为静态服务器，通过 `node` + `mongodb` + `pm2` 实现后端服务环境的搭建。

### 应用介绍

#### 应用功能简介

该应用支持和常规 PC 端产品类似的功能，如：

1. 支持窗口放大、缩小、置顶以及最小化到托盘等等。

2. 支持托盘消息提醒，以及通过托盘显示新消息的信息。

3. 支持应用快捷键设置、开机自启设置、窗口关闭设置等。

4. 支持同时开启多个子窗口，最多同时存在三个。

5. 支持下载内容到指定的文件夹中。

### 代表性页面示例

#### 首页介绍

![首页.png](http://43.143.27.249/image/032a4d6d14c016b0d017ba6ab6ec2565.png)

#### 标签云

![标签云.png](http://43.143.27.249/image/7cb42cd1208a4b0c94f83a12afb5c9f8.png)

### 应用下载

#### windows 版本

[windows 版](http://43.143.27.249:9216/image/dnhyxc.zip)

#### macOS 版本

[macOS 版](http://43.143.27.249:9216/image/dnhyxc-mac.zip)

#### 微笑

http://43.143.27.249/image/24b6f805c6687e5694cbee718.gif

#### 白眼

http://43.143.27.249/image/24b6f805c6687e5694cbee703.gif

#### 鄙视

http://43.143.27.249/image/24b6f805c6687e5694cbee704.gif

#### 龇牙

http://43.143.27.249/image/24b6f805c6687e5694cbee71f.gif

#### 烦恼

http://43.143.27.249/image/24b6f805c6687e5694cbee706.gif

#### 奋斗

http://43.143.27.249/image/24b6f805c6687e5694cbee707.gif

#### 害羞

http://43.143.27.249/image/24b6f805c6687e5694cbee709.gif

#### 鼓掌

http://43.143.27.249/image/24b6f805c6687e5694cbee708.gif

#### 好色

http://43.143.27.249/image/24b6f805c6687e5694cbee70a.gif

#### 坏笑

http://43.143.27.249/image/24b6f805c6687e5694cbee70b.gif

#### 滑稽

http://43.143.27.249/image/24b6f805c6687e5694cbee70c.gif

#### 可怜

http://43.143.27.249/image/24b6f805c6687e5694cbee70d.gif

#### 酷

http://43.143.27.249/image/24b6f805c6687e5694cbee70e.gif

#### 困

http://43.143.27.249/image/24b6f805c6687e5694cbee70f.gif

#### 哭笑

http://43.143.27.249/image/24b6f805c6687e5694cbee710.gif

#### 流泪

http://43.143.27.249/image/24b6f805c6687e5694cbee711.gif

#### 生气

http://43.143.27.249/image/24b6f805c6687e5694cbee712.gif

#### 衰

http://43.143.27.249/image/24b6f805c6687e5694cbee713.gif

#### 吐舌

http://43.143.27.249/image/24b6f805c6687e5694cbee714.gif

#### 吐血

http://43.143.27.249/image/24b6f805c6687e5694cbee715.gif

#### 挖鼻

http://43.143.27.249/image/24b6f805c6687e5694cbee716.gif

#### 委屈

http://43.143.27.249/image/24b6f805c6687e5694cbee717.gif

#### 啊这

http://43.143.27.249/image/24b6f805c6687e5694cbee702.gif

#### 捂嘴

http://43.143.27.249/image/24b6f805c6687e5694cbee719.gif

#### 吓

http://43.143.27.249/image/24b6f805c6687e5694cbee71a.gif

#### 晕

http://43.143.27.249/image/24b6f805c6687e5694cbee71b.gif

#### 再见

http://43.143.27.249/image/24b6f805c6687e5694cbee71c.gif

#### 眨眼

http://43.143.27.249/image/24b6f805c6687e5694cbee71d.gif

#### 皱眉

http://43.143.27.249/image/24b6f805c6687e5694cbee71e.gif

#### 大兵

http://43.143.27.249/image/24b6f805c6687e5694cbee705.gif
