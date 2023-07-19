import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import * as Service from '@/server';
import { normalizeResult } from '@/utils';
import { useCheckUserId } from '@/hooks';
import { AtlasList, AtlasItemParams } from '@/typings/common';

// const images = [
//   'https://pica.zhimg.com/80/v2-f167a66b1de479dc4a2b19d46701ad06_720w.webp?source=1940ef5c',
//   'https://pic1.zhimg.com/80/v2-779770684deae7ca6a9279909573ba65_720w.webp?source=1940ef5c',
//   'https://pic1.zhimg.com/80/v2-3cb57dd017a65b0d526c3e53f1258e20_720w.webp?source=1940ef5c',
//   'https://pica.zhimg.com/80/v2-1c56872d6db7f6abb1f0ed0f217dcd8b_720w.webp?source=1940ef5c',
//   'https://pic1.zhimg.com/80/v2-4faaf6c8394c3fec83ffd36aa182efa9_720w.webp?source=1940ef5c',
//   'https://pic1.zhimg.com/80/v2-4aec13609438cb7333e998efe2b6320b_720w.webp?source=1940ef5c',
//   'https://picx.zhimg.com/80/v2-bd8a5a507821105321dbeff322fccd25_720w.webp?source=1940ef5c',
//   'https://picx.zhimg.com/80/v2-52165e265072bdbd871fed8a569aa124_720w.webp?source=1940ef5c',
//   'https://picx.zhimg.com/80/v2-7332f2c479ffcbcdd095666841cf69c9_720w.webp?source=1940ef5c',
//   'https://picx.zhimg.com/80/v2-9ec71d6e870f42b2151e4cb72c4282a9_720w.webp?source=1940ef5c',
//   'https://pic1.zhimg.com/80/v2-f2ababed8b41526f6a15fa01e1781b47_720w.webp?source=1940ef5c',
//   'https://pic1.zhimg.com/80/v2-fe528b8923ccaf3ec29fc35ae94207a6_720w.webp?source=1940ef5c',
//   'https://pic1.zhimg.com/80/v2-2c55e37995a6705dd94b96f7af1b7ee5_720w.webp?source=1940ef5c',
//   'https://pic1.zhimg.com/80/v2-45c520a0b502bf0bfff5801523177aee_720w.webp?source=1940ef5c',
//   'https://picx.zhimg.com/80/v2-827c538a2826badeac957132dd47206d_720w.webp?source=1940ef5c',
//   'https://pica.zhimg.com/80/v2-50e6ef96c9cfb4ad66891b23b6ec0c4f_720w.webp?source=1940ef5c',
//   'https://picx.zhimg.com/80/v2-e8d15e00479ae72eba988f88b94aa71b_720w.webp?source=1940ef5c',
//   'https://pic1.zhimg.com/80/v2-c79151a0795c6542922c1be433b626c8_720w.webp?source=1940ef5c',
//   'https://picx.zhimg.com/80/v2-7f7ce4c8c8f0197a1cc0e34048518e26_720w.webp?source=1940ef5c',
//   'https://picx.zhimg.com/80/v2-f7a66328a0470f73c523e4957f48a3f5_720w.webp?source=1940ef5c',
//   'https://pic1.zhimg.com/80/v2-39f808371dc21a064fc5900be6438f3e_720w.webp?source=1940ef5c',
//   'https://picx.zhimg.com/80/v2-3a7baf2bc3db376be7fd216e25a2c3d1_720w.webp?source=1940ef5c',
//   'https://pica.zhimg.com/80/v2-cf663a78b57d3f0ec2519d9b6b786c60_720w.webp?source=1940ef5c',
//   'https://picx.zhimg.com/80/v2-dce89ae04b9a6c87d83277e8359d6973_720w.webp?source=1940ef5c',
//   'https://pica.zhimg.com/80/v2-1c56872d6db7f6abb1f0ed0f217dcd8b_720w.webp?source=1940ef5c',
//   'https://pic1.zhimg.com/80/v2-4faaf6c8394c3fec83ffd36aa182efa9_720w.webp?source=1940ef5c',
//   'https://pic1.zhimg.com/80/v2-4aec13609438cb7333e998efe2b6320b_720w.webp?source=1940ef5c',
//   'https://picx.zhimg.com/80/v2-bd8a5a507821105321dbeff322fccd25_720w.webp?source=1940ef5c',
//   'https://picx.zhimg.com/80/v2-52165e265072bdbd871fed8a569aa124_720w.webp?source=1940ef5c',
//   'https://picx.zhimg.com/80/v2-7332f2c479ffcbcdd095666841cf69c9_720w.webp?source=1940ef5c',
//   'https://picx.zhimg.com/80/v2-9ec71d6e870f42b2151e4cb72c4282a9_720w.webp?source=1940ef5c',
//   'https://pic1.zhimg.com/80/v2-f2ababed8b41526f6a15fa01e1781b47_720w.webp?source=1940ef5c',
// ];

interface IProps {
  loading: boolean | null;
  atlasList: AtlasItemParams[];
  pageNo: number;
  pageSize: number;
  total: number; // 文章列表总数
}

export const useAtlasStore = defineStore('atlas', {
  state: (): IProps => ({
    loading: null,
    atlasList: [],
    total: 0,
    pageNo: 0,
    pageSize: 50,
  }),

  actions: {
    // 获取图片集列表
    async getAtlasList() {
      // 检验是否有userId，如果没有禁止发送请求
      if (!useCheckUserId()) return;
      if (this.atlasList.length !== 0 && this.atlasList.length >= this.total) return;
      this.pageNo = this.pageNo + 1;
      this.loading = true;
      const res = normalizeResult<AtlasList>(
        await Service.getAtlasList({ pageNo: this.pageNo, pageSize: this.pageSize }),
      );
      this.loading = false;
      if (res.success) {
        this.atlasList = [...this.atlasList, ...res.data.list];
        this.total = res.data.total;
      } else {
        ElMessage({
          message: res.message,
          type: 'error',
          offset: 80,
        });
      }
    },

    // 添加图片
    async addAtlasImages(url: string) {
      const res = normalizeResult<{ url: string }>(await Service.addAtlasImages(url));
      ElMessage({
        message: res.message,
        type: res.success ? 'success' : 'error',
        offset: 80,
      });
      if (res.success) {
        this.clearAtlasInfo();
        this.getAtlasList();
      }
    },

    // 删除图片集列表
    async deleteAtlasImages({ id, url }: { id: string; url: string }) {
      const res = normalizeResult<{ url: string }>(await Service.deleteAtlasImages({ id, url }));
      ElMessage({
        message: res.message,
        type: res.success ? 'success' : 'error',
        offset: 80,
      });
      if (res.success) {
        this.clearAtlasInfo();
        this.getAtlasList();
      }
    },

    // 清除数据
    clearAtlasInfo() {
      this.pageNo = 0;
      this.total = 0;
      this.atlasList = [];
      this.loading = null;
    },
  },
});
