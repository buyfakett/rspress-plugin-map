# rspress-plugin-map

Rspress v2 插件，用于在文章中插入交互式地图，支持 Google 地图、高德地图、百度地图、Geoq 地图和 OpenStreetMap。

## 特性

- 支持多种地图类型：混合地图（可切换多个图层）、Google 地图、高德地图、百度地图、Geoq 地图、OpenStreetMap
- 支持标记点和提示文本
- 支持自定义地图容器宽高、缩放等级、经纬度等参数
- 使用 HTML 标签方式调用，简单易用

## 安装

```bash
npm install rspress-plugin-map --save
```

## 配置

在 `rspress.config.ts` 中添加插件配置：

```typescript
import { defineConfig } from 'rspress/config';
import pluginMap from 'rspress-plugin-map';

export default defineConfig({
  plugins: [
    pluginMap()
  ]
});
```

## 使用

在 Markdown 文件中使用 `<rspress-map>` 标签插入地图：

### 基本用法

```html
<rspress-map type="hybrid" lat="39.9042" lng="116.4074" />
```

### 自定义参数

所有参数都是可选的，未指定时使用默认值：

```html
<rspress-map 
  type="hybrid" 
  lat="39.9042" 
  lng="116.4074" 
  zoom="12" 
  width="100%" 
  height="500px" 
  marker="true" 
  marker-text="北京市"
 />
```

### 参数说明

| 参数 | 说明 | 默认值 | 可选值 |
|------|------|--------|--------|
| type | 地图类型 | hybrid | hybrid, google, gaode, baidu, geoq, openstreet |
| lat | 纬度 | 39.9042 | 数值 |
| lng | 经度 | 116.4074 | 数值 |
| zoom | 缩放等级 | 16 | 1-18 |
| width | 容器宽度 | 100% | CSS 尺寸值 |
| height | 容器高度 | 400px | CSS 尺寸值 |
| marker | 是否显示标记点 | true | true, false |
| marker-text | 标记点提示文本 | "" | 字符串 |

### 地图类型说明

- **hybrid**: 混合地图，支持切换 Google、高德、百度、Geoq、OpenStreetMap 等多个图层
- **google**: Google 地图
- **gaode**: 高德地图
- **baidu**: 百度地图
- **geoq**: Geoq 地图
- **openstreet**: OpenStreetMap

## 注意事项

1. 插件会自动加载所需的地图脚本，无需手动引入。

2. 混合地图使用 Leaflet 实现，依赖 `leaflet` 和 `leaflet.chinatmsproviders` 库。

## 示例

### 混合地图

```html
<rspress-map type="hybrid" lat="39.9042" lng="116.4074" zoom="12" marker-text="北京市" />
```

### Google 地图

```html
<rspress-map type="google" lat="39.9042" lng="116.4074" zoom="12" marker-text="北京市" />
```

### 高德地图

```html
<rspress-map type="gaode" lat="39.9042" lng="116.4074" zoom="12" marker-text="北京市" />
```

### 百度地图

```html
<rspress-map type="baidu" lat="39.9042" lng="116.4074" zoom="12" marker-text="北京市" />
```

### Geoq 地图

```html
<rspress-map type="geoq" lat="39.9042" lng="116.4074" zoom="12" marker-text="北京市" />
```

### OpenStreetMap

```html
<rspress-map type="openstreet" lat="39.9042" lng="116.4074" zoom="12" marker-text="北京市" />
```
