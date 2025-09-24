# B站播放体验改善油猴插件

## 功能介绍

这是一个用于改善B站（哔哩哔哩）视频播放体验的油猴插件。它可以自动根据UP主设置不同的播放参数，包括：

- 字幕开关
- 播放速度
- 自动连播
- 弹幕开关

## 安装方法

1. 安装Tampermonkey浏览器扩展
2. 点击插件脚本 `bilibiliBeterPlay.js` 进行安装
3. 插件将自动在B站视频页面生效

## 配置说明

在脚本中的 `config` 部分可以配置以下选项：

### 全局配置
- `enableLogging` (boolean)：启用调试日志输出，默认值为true。设为false可关闭控制台日志
  ```js
  enableLogging: true, // 示例：开启日志输出
  ```

### 特定UP主配置
通过 `specialUps` 数组可配置需要特殊设置的UP主，每个配置项包含以下参数：
- `up` (string)：**必填**，UP主账号名称（需与B站页面显示完全一致）
- `subtitle` (boolean)：是否自动开启字幕，默认false
- `rate` (number)：播放速度，支持0.5-2.0（支持0.5倍速到2.0倍速）
- `autoPlay` (boolean)：是否开启自动连播，默认false
- `dm` (boolean)：是否显示弹幕，默认true

配置示例：
```js
specialUps: [{
  up: '黑马程序员',
  subtitle: true,  // 自动开启字幕
  rate: 2,         // 2倍速播放
  autoPlay: true,  // 开启自动连播
  dm: false        // 关闭弹幕
}, {
  up: '官方教程账号',
  subtitle: false, // 关闭字幕
  rate: 1.5,       // 1.5倍速
  autoPlay: false  // 关闭自动连播
  // 未指定dm参数时使用默认值true
}]
```

### 注意事项
1. 配置变更后需重新加载页面生效
2. UP主名称需与视频页面显示完全一致（包括空格和特殊符号）
3. 未匹配到UP主时使用默认设置：1倍速/关闭字幕/关闭自动连播/开启弹幕
4. 支持同时配置多个UP主，按数组顺序优先匹配第一个