---
title: 为WSL设置代理
categories:
  - 技术分享
tags:
  - Linux
  - 技术分享
abbrlink: 6558428b
date: 2025-11-22 01:04:33
---

# 为 WSL2 设置代理

WSL 有两个配置文件：

- `.wslconfig`：适用于所有 WSL 的配置
- `wsl.conf`：在`/etc`目录下，仅适用于对应的特定 Linux 发行版

`.wslconfig`文件在`~/`目录下，即`C:\Users\<UserName>\.wslconfig`

但是`.wslconfig`文件默认并不存在，需要手动创建。

在正确的目录下创建文件，示例如下

```ini
[wsl2]
# 开启自动代理
autoProxy=true

# 开启 DNS 隧道
dnsTunneling=true

# 开启镜像网络模式
networkingMode=mirrored

# 同步防火墙规则
firewall=true

[experimental]
# 自动回收内存
autoMemoryReclaim=gradual

# 自动释放硬盘空间
sparseVhd=true
```

要使 WSL 使用 Windows 的代理，需要设置`autoProxy=true`，强制 WSL 使用 Windows 的 HTTP 代理信息。

参考资料：

[^1]: https://learn.microsoft.com/en-us/windows/wsl/wsl-config
[^2]: https://learn.microsoft.com/en-us/windows/wsl/networking
