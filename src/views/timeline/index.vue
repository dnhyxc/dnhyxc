<!--
 * 时间轴
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="timeline-wrap">
    <el-scrollbar ref="scrollRef" wrap-class="scrollbar-wrapper">
      <el-timeline class="el-timeline">
        <el-timeline-item timestamp="2018/4/12" placement="top" type="primary">
          <el-card>
            <h4>Update Github template</h4>
            <p>Tom committed 2018/4/12 20:46</p>
          </el-card>
        </el-timeline-item>
        <el-timeline-item timestamp="2018/4/3" placement="top">
          <el-card>
            <h4>Update Github template</h4>
            <p>Tom committed 2018/4/3 20:46</p>
          </el-card>
        </el-timeline-item>
        <el-timeline-item timestamp="2018/4/2" placement="top">
          <el-card>
            <h4>Update Github template</h4>
            <p>Tom committed 2018/4/2 20:46</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="less">
@import '@/styles/index.less';

.timeline-wrap {
  width: 100%;
  height: 100%;

  :deep {
    .el-timeline {
      margin: 0 10px;
    }
  }
}
</style>
