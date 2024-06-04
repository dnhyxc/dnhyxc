### 绘制草图类型的矩形

```js
// 获取Canvas元素和2D绘图上下文
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

// 设置线条样式
ctx.lineWidth = 2;
ctx.lineCap = 'round'; // 线条的端点样式
ctx.lineJoin = 'round'; // 线条的连接样式

// 定义绘制草图矩形的函数
function drawRoughRectangle(x, y, width, height) {
  ctx.beginPath();

  // 绘制上边框
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y);

  // 绘制右边框
  ctx.moveTo(x + width, y);
  ctx.lineTo(x + width, y + height);

  // 绘制下边框
  ctx.moveTo(x + width, y + height);
  ctx.lineTo(x, y + height);

  // 绘制左边框
  ctx.moveTo(x, y + height);
  ctx.lineTo(x, y);

  // 添加一些随机的不规则线条
  for (var i = 0; i < 10; i++) {
    var offsetX = Math.random() * 20 - 10;
    var offsetY = Math.random() * 20 - 10;
    var randomWidth = Math.random() * 5;

    ctx.moveTo(x + width / 2 + offsetX, y + offsetY);
    ctx.lineTo(x + width / 2 + offsetX, y + height + offsetY);
    ctx.lineWidth = randomWidth;
  }

  ctx.stroke(); // 绘制线条
}

// 调用绘制函数
drawRoughRectangle(50, 50, 200, 150);
```
