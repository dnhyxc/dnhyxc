<!--
 * 标签云
 * @author: dnhyxc
 * @since: 2023-02-14
 * index.vue
-->
<template>
  <div class="word-cloud">
    <div class="title">{{ title }}</div>
    <div ref="charts" :style="{ ...styles }" />
    <div v-if="loading !== null && !loading && !data?.length" class="empty-wrap">
      <img :src="EMPTY" />
      <span class="empty-text">空空如也</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted, watch, computed } from 'vue';
import * as echarts from 'echarts';
import 'echarts-wordcloud';
import { SEA_BASE64, EMPTY } from '@/constant';

interface IProps {
  data: { name: string; value: number }[];
  callback: (name: string) => void;
  title?: string;
  styles?: any;
  loading?: boolean | null;
}

const props = withDefaults(defineProps<IProps>(), {
  data: () => [],
  title: '文章标签云',
  styles: {
    with: '100%',
    height: '100%',
  },
  loading: null,
});

// 图表元素
const charts = ref<HTMLElement | null>(null);
// 图表实例
let myChart: any = null;

onMounted(() => {
  // 初始化词云
  if (charts.value) {
    myChart = echarts.init(charts.value!);
    // 绘制图表
    drawChart();
    // 点击某个字
    myChart.on('click', (params: { data: { name: string; value: number } }) => {
      const { name } = params.data;
      props.callback && props.callback(name);
    });
    // 设备视口大小改变时，重置 echarts
    window.addEventListener('resize', resize);
  }
});

onUnmounted(() => {
  // 移除监听事件
  window.removeEventListener('resize', resize);
});

const styles = computed(() => props.styles);

/**
 *  监听 data 的变化, 处理数据、重绘词云
 */
watch(
  () => [props.data, props.styles],
  () => {
    drawChart();
  },
  {
    deep: true,
  },
);

// 绘制图表事件
const drawChart = () => {
  const maskImage = new Image();
  // 配置
  const option = {
    series: [
      {
        // echarts 类型
        type: 'wordCloud',
        // 字体大小范围。默认最小12px，最大60px大小。
        sizeRange: [14, 30],
        // [0, 0] 词不旋转，步长为0。
        // 文字旋转范围和步进度。文本将在[0,0]范围内由rotationStep 0 随机旋转。
        rotationRange: [0, 0],
        // 词旋转步长
        rotationStep: 0,
        // 网格大小以像素为单位，用于标记画布的可用性，网格大小越大，词之间的间隙越大。
        gridSize: 8,
        // 把“云”的形状画出来。可以是任何表示为回调函数的极坐标方程，也可以是present的关键字。
        // 有圆形(默认)、心形(苹果或心形曲线，最著名的极坐标方程)、菱形(正方形的别名)、正三角形、
        // 三角形、(直三角形、五边形、星形的别名)。
        shape: 'pentagon',
        // 背景图，可自定义背景图，词云会按照背景图的范围分布。比如背景图是一个心形，
        // 那么词云足够多的时候就会形成一个心形。
        maskImage,
        // 设置为true，允许词超出画布范围。允许词大于画布的尺寸被绘制。
        drawOutOfBound: false,
        // 是否开启动画效果
        layoutAnimation: true,
        // 保持maskImage的纵横比或1:1的形状这个选项是支持的echarts-wordcloud@2.1.0
        keepAspect: true,
        // 全局设置词的样式
        textStyle: {
          // fontWeight: 'bold',
          // 配色函数制定配色机制： Math.round() 和 Math.random() 随机给词配色
          color() {
            return `rgb(${[
              Math.round(Math.random() * 225),
              Math.round(Math.random() * 225),
              Math.round(Math.random() * 225),
            ].join(',')})`;
          },
        },
        emphasis: {
          // 每个数据项还支持 textStyle，给单个词自定义文本样式
          textStyle: {
            // 鼠标hover颜色
            color: '#FF863C',
            // color: "#1da57a",
            fontWeight: 'bold',
          },
        },
        left: 'center',
        top: 'center',
        right: null,
        bottom: null,
        // 数据是一个数组，每个数据项必须包含 name 和 value 属性。name是词，value是词的系数（频率）。
        data: props.data,
      },
    ],
  };

  maskImage.onload = () => {
    // 画布清除
    myChart.clear();
    myChart.setOption(option);
  };

  // 放在 public 的img资源使用绝对路径引入有效，或先 import 引入图片资源，再赋值也有效。
  maskImage.src = SEA_BASE64; // 海岛
};

// 重新设置图表的尺寸
const resize = () => {
  nextTick(() => {
    myChart.resize();
  });
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.word-cloud {
  position: relative;
  height: 100%;
  width: 100%;

  .title {
    position: absolute;
    top: 10px;
    right: 15px;
    font-size: 18px;
    color: var(--active-color);
    .textLg();
  }

  .empty-wrap {
    position: absolute;
    top: 50%;
    left: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    transform: translate(-50%, -50%);
    display: flex;
    .clickNoSelectText();

    .empty-text {
      color: var(--font-3);
    }
  }
}
</style>
