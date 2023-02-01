<!--
 * 自定义轮播图
 * @author: dnhyxc
 * @since: 2023-02-01
 * index.vue
-->
<template>
  <div class="Rotation">
    <div class="out">
      <div class="inner">
        <div class="img">
          <img :src="IMG1" alt="" />
        </div>
        <div class="img">
          <img :src="IMG2" alt="" />
        </div>
        <div class="img">
          <img :src="IMG3" alt="" />
        </div>
        <div class="img">
          <img :src="IMG4" alt="" />
        </div>
        <div class="img">
          <img :src="IMG5" alt="" />
        </div>
        <div class="img">
          <img :src="IMG3" alt="" />
        </div>
        <div class="img">
          <img :src="IMG2" alt="" />
        </div>
      </div>
      <div class="arrow">
        <i class="fas fa-chevron-left left"></i>
        <i class="fas fa-chevron-right right"></i>
      </div>
      <div class="button">
        <p v-for="i in 6" :key="i" class="dot" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import IMG1 from '@/assets/images/1.jpg';
import IMG2 from '@/assets/images/2.jpg';
import IMG3 from '@/assets/images/3.jpg';
import IMG4 from '@/assets/images/4.jpg';
import IMG5 from '@/assets/images/5.jpg';

onMounted(() => {
  const img = document.querySelectorAll('.img');
  const left = document.querySelector('.left');
  const right = document.querySelector('.right');
  const buttons = document.querySelectorAll('.dot');

  // 设置一个数组，用来存id
  const idArr = ['first', 'second', 'right', 'left', 'left', 'left', 'last'];

  // 设置一个变量用来当图片的索引
  let index = 0;

  initialize();

  // 设置一个定时器，让图片轮播
  let timer: any = setInterval(next, 3000);

  // 给箭头绑定点击事件
  left?.addEventListener('click', prev);
  // 当鼠标放到箭头上时，让定时器停止
  left?.addEventListener('mouseover', () => {
    clearInterval(timer);
    timer = null;
  });
  // 当鼠标离开箭头时，让定时器重新开始
  left?.addEventListener('mouseout', () => {
    timer = setInterval(next, 3000);
  });

  right?.addEventListener('click', next);

  right?.addEventListener('mouseover', () => {
    clearInterval(timer);
    timer = null;
  });
  right?.addEventListener('mouseout', () => {
    timer = setInterval(next, 3000);
  });

  // 给小方块添加点击事件
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('mousedown', () => {
      // 在用户点击的时候关闭定时器
      clearInterval(timer);
      timer = null;
      // 这里需要判断用户点击的小方块与当前图片的索引之差，如果
      // 大于0，则表明用户需要更换的是后面的图片，反之，表明用户
      // 需要更换之前也就是前面的图片
      if (index > i) {
        let x = index - i;
        while (x--) {
          prev();
        }
      } else if (index < i) {
        let x = i - index;
        while (x--) {
          next();
        }
      }
    });
  }

  // 创建切换图片的函数
  function prev() {
    // 切换上一张也就是让数组的最后一个元素变成第一个元素
    idArr.push(idArr.shift()!);
    initialize();
    if (index === 0) {
      index = buttons.length - 1;
    } else {
      index--;
    }
    clearColor();
  }
  function next() {
    // 跟上面反过来
    idArr.unshift(idArr.pop()!);
    initialize();
    if (index === buttons.length - 1) {
      index = 0;
    } else {
      index++;
    }
    clearColor();
  }

  // 创建一个函数用来让小方块跟随图片运动
  function clearColor() {
    for (let i = 0; i < buttons.length; i++) {
      (buttons[i] as any).style.backgroundColor = 'silver';
    }
    // 让当前的索引变色
    (buttons[index] as any).style.backgroundColor = 'rgb(20, 134, 187)';
  }

  // 创建一个函数用来初始化图片
  function initialize() {
    for (let i = 0; i < img.length; i++) {
      img[i].id = idArr[i];
    }
  }
});
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.Rotation {
  box-sizing: border-box;
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 99;

  .out {
    position: relative;
    width: 100%;
    height: 230px;

    .inner {
      height: 100%;
      .img {
        width: 60%;
        height: 230px;
        position: absolute;
        transition: 0.3s;

        img {
          width: 100%;
          height: 100%;
        }
      }
    }

    .arrow {
      font-size: 32px;
      i {
        position: absolute;
        color: #fff;
        z-index: 9999;
        cursor: pointer;
        top: 85px;
      }
      .left {
        left: 0;
      }
      .right {
        left: 780px;
      }
    }

    .button {
      width: 175px;
      height: 15px;
      position: absolute;
      z-index: 9999;
      left: 50%;
      transform: translateX(-50%);
      p {
        width: 15px;
        height: 15px;
        float: left;
        margin: 0 5px;
        cursor: pointer;
        background-color: silver;
        &:first-child {
          background-color: rgb(20, 134, 187);
        }
      }
    }

    //设置id样式
    #last {
      transform: translateX(0);
      z-index: 9;
      opacity: 1;
    }
    #first {
      position: absolute;
      left: 50%;
      top: 0;
      transform: translateX(-50%) scale(1.2);
      z-index: 99;
      opacity: 1;
    }
    #second {
      position: absolute;
      right: 0;
      transform: translateX(0);
      z-index: 1;
      opacity: 1;
    }
    #left {
      position: absolute;
      left: 0;
      z-index: 99;
      opacity: 0;
    }
    #right {
      transform: translateX(500px);
      z-index: 1;
      opacity: 0;
    }
  }
}
</style>
