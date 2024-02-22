/* eslint-disable indent */
import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import * as Service from '@/server';
import { normalizeResult, md5HashName, getUniqueFileName, compressImage } from '@/utils';
import { useCheckUserId } from '@/hooks';
import { pictureStore } from '.';

interface IProps {
  visible: boolean;
}

// 公共store
export const useUploadStore = defineStore('upload', {
  state: (): IProps => ({
    visible: false,
  }),

  actions: {
    // 文件上传
    async uploadFile(file: File, isAtlas?: boolean, quality = 0.5) {
      // 上传前先压缩图片
      const { file: compressFile } =
        quality !== 1
          ? await compressImage({
              file,
              quality, // 压缩比例
              mimeType: file.type,
            })
          : { file };
      // 检验是否有userId，如果没有禁止发送请求
      if (!useCheckUserId()) return;
      const formData = new FormData();
      // 根据文件资源生成 MD5 hash
      const fileName = (await md5HashName(compressFile)) as string;
      if (isAtlas) {
        const findOne = pictureStore.atlasList.find((i) => i.url.includes(fileName));
        if (findOne) return;
      }
      const findIndex = compressFile?.name?.lastIndexOf('.');
      const ext = compressFile.name.slice(findIndex + 1);
      // 修改文件名称，__ATLAS__ 用户区分是否是上传的图片集图片
      const newFile = new File([compressFile], isAtlas ? `__ATLAS__${fileName}.${ext}` : `${fileName}.${ext}`, {
        type: compressFile.type,
      });
      formData.append('file', newFile);
      const res = normalizeResult<{ filePath: string }>(await Service.uploadFile(formData));
      if (res.success) {
        this.visible = true;
        return {
          filePath: res.data.filePath,
          compressFile,
        };
      }
    },

    // 上传除图片之外的文件
    async uploadOtherFile(file: File) {
      // 检验是否有userId，如果没有禁止发送请求
      if (!useCheckUserId()) return;
      if (file.size / 1024 / 1024 > 100) {
        ElMessage({
          message: '文件大小超过 100 M，无法上传！',
          type: 'warning',
          offset: 80,
        });
        return false;
      }
      const formData = new FormData();
      // 根据文件资源生成 MD5 hash
      const { fileName, newFile } = await getUniqueFileName(file);
      formData.append('file', newFile);
      const res = normalizeResult<{ filePath: string }>(await Service.uploadFile(formData));
      if (res.success) {
        return {
          filePath: res.data.filePath,
          fileName,
        };
      }
    },

    // 删除文件
    async removeFile(url: string) {
      // 检验是否有userId，如果没有禁止发送请求
      if (!useCheckUserId()) return;
      normalizeResult<{ filePath: string }>(await Service.removeFile(url));
    },
  },
});
