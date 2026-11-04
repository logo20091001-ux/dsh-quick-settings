# dsh-quick-settings

**把设置从头像菜单里解放出来。**

设置原本藏在左下角的账号菜单里——点开头像，再点「设置」，两下。这个插件把那一行搬出来，做成侧边栏里常驻的一行：

```
⚙  设置
```

点一下，设置直接打开。

![sidebar row](https://img.shields.io/badge/looks%20like-a%20sidebar%20row-4b6bfb)

---

## 为什么

`Ctrl + ,` 已经能开设置，但那是给键盘的。鼠标用户每次都得"点头像 → 设置"，或者记住一个快捷键。这一行就是那个快捷键，长了个样子。

## 安装

**桌面端（推荐）**

`设置 → 插件`，粘贴包名安装，然后重启应用。

```
dsh-quick-settings
```

**命令行（纯 web profile）**

```sh
dsh plugin --profile web add dsh-quick-settings
```

> 桌面端（Electron）的 profile 只允许应用自己管理，`dsh plugin add` 写不进去，会报 `profile "desktop" is managed exclusively by the Electron application`。桌面端请走上面的插件页。

**从本地目录装**

```sh
dsh plugin --profile web add /绝对路径/dsh-quick-settings
```

## 行为

- 位置：侧边栏底部、账号那一行的**上方**，宽度铺满
- 侧边栏收起成窄条时，只留图标，和同区域的其他控件一起对齐
- 点击调用的是宿主自己的 `settings.open` 命令（也就是 `Ctrl+,` 背后那条），因此弹窗的焦点、遮罩、Esc 关闭、模态栈行为和快捷键完全一致
- 不伪造点击、不接管 DOM、不改内核

## 兼容性

- 在 DSH `0.1.x` 桌面版（Windows）实测通过
- 依赖宿主的 `shortcuts` 服务与 `sidebar.footer.action` 插槽；两者缺失时按钮不出现或点击无反应，不会报错，也不会影响其它界面
- 仓库只有一个客户端组件，无构建步骤、无第三方运行时依赖

## 卸载

`设置 → 插件` 里停用或移除，然后重启。它是纯增量插件，卸载后不留残留。

## 许可

MIT
