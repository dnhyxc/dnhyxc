import Compress from 'compressorjs';

interface IProps {
  file: File;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  mimeType?: string;
  container?: HTMLElement; // 渲染预览图片的容器
}

export const compressImage = ({
  file,
  quality = 0.6,
  maxWidth,
  maxHeight,
  mimeType = 'image/jpeg',
  container,
}: IProps) => {
  return new Promise((resolve, reject) => {
    const options = {
      quality,
      maxWidth,
      maxHeight,
      mimeType,
      success: (data: File) => {
        console.log(data, 'result');
        const img = new Image();
        img.className = 'compress-image';
        img.src = URL.createObjectURL(data);
        img.onload = (e: Event) => {
          const target = e.target as HTMLImageElement;
          console.log(target.src, 'target.src');
          URL.revokeObjectURL(target.src);
          container?.appendChild(img);
        };
        // const reader = new FileReader();
        // reader.onload = async (e: Event) => {
        //   const url = (e.target as FileReader).result;
        //   console.log(url, 'url');
        // };
        // reader.readAsDataURL(data);
        resolve(data);
      },
      error: function (err: Error) {
        console.log(err.message);
        reject(err.message);
      },
    };
    new Compress(file, options);
  });
};
